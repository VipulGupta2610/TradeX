import user from "../schemas/user.schema.js"
import bcryptjs from "bcryptjs"

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
            const sending_user = await newUser.select("-password")
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
        const { email, isPass , password } = req.body;
        const isExist = await user.findOne({ email })
        if (!isExist) {
            console.log("User not found")
            return res.status(400).json({ message: "User not found" })
        }
        if (isPass == true){
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