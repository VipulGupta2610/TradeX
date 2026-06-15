import User from "../schemas/user.schema.js"

export const Number_of_users= async (req,res)=>{
    try {
        const totalUsers = User.find().length();
        console.log(totalUsers)
        res.status(200).json({message:totalUsers});
    } catch (error) {
        console.log("Error at admin")
        console.log(error)
        res.status(500).json({message:"Internal server error",error})
    }
}