import user from "../schemas/user.schema.js"
import bcryptjs from "bcryptjs"
import orders from "../schemas/orders.schema.js";
import positions from "../schemas/positions.schema.js";
import watchlist from "../schemas/watchlist.schema.js";
import { redis } from "../index.js";
import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()

export const signup = async (req, res) => {
    try {
        const { name, email, isPass, password } = req.body;
        const isUser = await user.findOne({ email });
        if (isUser) {
            console.log("User alraedy exists")
            return res.status(500).json({ message: "User alraedy exists" })
        }
        let newUser;
        if (isPass) {
            const hashpass = await bcryptjs.hash(password, 10)
            newUser = new user({
                name, email, isPass: true, password: hashpass
            })
            await newUser.save()
            const sending_user = await user
                .findById(newUser._id)
                .select("-password");
            return res.status(200).json({ message: 'User created successfully', sending_user })
        }
        else {
            newUser = new user({
                name, email, isPass: false
            })
            await newUser.save();
            const sending_user = await user.findOne({ email }).select("-password")
            return res.status(200).json({ message: "User created successfully", sending_user })
        }
    } catch (error) {
        console.log("Error at signup")
        console.log(error)
        return res.status(500).json({ message: 'Internal Server error' })
    }
}

export const login = async (req, res) => {
    try {
        const { email, isPass, password } = req.body;
        const isExist = await user.findOne({ email })
        if (!isExist) {
            console.log("User not found")
            return res.status(400).json({ message: "User not found" })
        }
        if (isPass == true) {
            const isMactch = await bcryptjs.compare(password, isExist.password);
            if (!isMactch) {
                console.log("Wrong password")
                return res.status(500).json({ message: "Wrong password" })
            }
        }
        const info = await user.findOne({ email }).select("-password")
        return res.status(200).json({ message: "Login successfully", info })
    } catch (error) {
        return res.status(500).json({ message: "Error at loggin in ", error })
    }
}
// Email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Reads from .env
        pass: process.env.EMAIL_PASS  // Reads from .env
    }
})

export const otp_for_reset_password = async (req, res) => {
    try {
        const { email } = req.body;
        const isExist = await user.findOne({ email })
        if (!isExist) {
            return res.status(400).json({ message: "User not signuped" })
        }
        if (!isExist.isPass) {
            return res.status(429).json({ message: "No password needed Login with google" })
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await redis.set(`otp:${email}`, otp, "EX", 600)
        const message = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px;">
    <h2 style="color: #2563eb;">TradeX Password Reset</h2>

    <p>Hello,</p>

    <p>Use the following OTP to reset your password:</p>

    <div style="
        background: #f3f4f6;
        border: 2px dashed #2563eb;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        margin: 20px 0;
    ">
        <span style="
            font-size: 36px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 8px;
        ">
            ${otp}
        </span>
    </div>

    <p>This OTP will expire in <b>10 minutes</b>.</p>

    <p>If you did not request a password reset, please ignore this email.</p>

    <hr>

    <p style="color: gray; font-size: 12px;">
        © 2026 TradeX. All rights reserved.
    </p>
</div>
`;
        try {
            await transporter.sendMail({
                to: email,
                subject: "OTP for reseting password",
                html: message
            })
            return res.status(200).json({ message: "OTP sent to registerd email" })
        } catch (error) {
            console.log("Error at internal tryCatch of change Password")
            console.log(error)
        }
    } catch (error) {
        console.log("Error at otp for password chnaging")
        console.log(error)
        return res.status(500).json({ message: "Internal Server error", error })
    }
}

export const veify_otp = async (req, res) => {
    try {
        const {email , otp} = req.body;
        const cached_otp = await redis.get(`otp:${email}`)
        if (!cached_otp){
            return res.status(429).json({message:"OTP expired"})
        }
        if (cached_otp == otp){
            await redis.del(`otp:${email}`)
            return res.status(200).json({message:"OTP matched"})
        }
      
            return res.status(500).json({message:"OTP didn't matched"})
       
    } catch (error) {
console.log("Error at otp verification")
console.log(error)
return res.status(500).json({message:"Internal server error"})
    }
}


export const updateProfile = async (req, res) => {
    try {
        const { name, plan } = req.body;
        const updates = {};
        if (typeof name === "string" && name.trim()) updates.name = name.trim();
        if (["free", "pro", "enterprise"].includes(plan)) updates.plan = plan;

        const updated = await user.findByIdAndUpdate(
            req.params.userid,
            updates,
            { new: true, runValidators: true }
        ).select("-password");

        if (!updated) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ message: "Profile updated", user: updated });
    } catch (error) {
        return res.status(500).json({ message: "Unable to update profile" });
    }
};

export const resetPaperAccount = async (req, res) => {
    try {
        const userid = req.params.userid;
        await Promise.all([
            orders.deleteMany({ userid }),
            positions.deleteMany({ userid }),
            user.findByIdAndUpdate(userid, {
                virtualBalance: 100000,
                totalPortfolioValue: 100000
            })
        ]);
        return res.status(200).json({ message: "Paper account reset", balance: 100000 });
    } catch (error) {
        return res.status(500).json({ message: "Unable to reset account" });
    }
};

export const adjustVirtualFunds = async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        if (!Number.isFinite(amount) || amount === 0) {
            return res.status(400).json({ message: "Enter a valid amount" });
        }

        const query = amount < 0
            ? { _id: req.params.userid, virtualBalance: { $gte: Math.abs(amount) } }
            : { _id: req.params.userid };
        const account = await user.findOneAndUpdate(
            query,
            { $inc: { virtualBalance: amount, totalPortfolioValue: amount } },
            { new: true }
        ).select("-password");

        if (!account) return res.status(400).json({ message: "Insufficient virtual cash" });
        return res.status(200).json({ message: "Virtual funds updated", user: account });
    } catch (error) {
        return res.status(500).json({ message: "Unable to update virtual funds" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const userid = req.params.userid;
        await Promise.all([
            orders.deleteMany({ userid }),
            positions.deleteMany({ userid }),
            watchlist.deleteMany({ userid }),
            user.findByIdAndDelete(userid)
        ]);
        return res.status(200).json({ message: "Account deleted" });
    } catch (error) {
        return res.status(500).json({ message: "Unable to delete account" });
    }
};
