import User from "../schemas/user.schema.js";
import Order from "../schemas/orders.schema.js";
import bugs from "../schemas/bugreport.schema.js";

export const Number_of_users = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();

        // Fetch all user details
        const allUsers = await User.find().sort({ createdAt: -1 });

        // Today's date range
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todayOrders = await Order.find({
            createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).sort({ createdAt: -1 });

        const todayOrdersCount = todayOrders.length;

        res.status(200).json({
            totalUsers,
            totalOrders,
            todayOrdersCount,
            todayOrders,
            allUsers // <-- Added this to the response
        });

    } catch (error) {
        console.log("Error at admin");
        console.log(error);

        res.status(500).json({
            message: "Internal server error",
            error
        });
    }
};

export const fetch_bugs = async (req , res)=>{
    try {
        const bug = await bugs.find().sort({updatedAt:-1})
        console.log("Bugs fetched")
      return  res.status(200).json(bug)

    } catch (error) {
        console.log("Error at bugs fetching")
        console.log(error)
        return res.status(500).json({message:"Internal server error"})
    }
}

export const delete_bug = async (req  , res)=>{
    try {
        const {bugId} = req.params;
        await bugs.findOneAndDelete({_id:bugId})
        console.log("Bug deleted")
        return res.status(200).json({message:'Bug deleted'})
    } catch (error) {
        console.log("Error at delete bug")
        console.log(error)
        return res.status(500).json({message:"Internal server error",error})
    }
}

