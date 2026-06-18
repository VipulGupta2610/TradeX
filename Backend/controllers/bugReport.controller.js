import bugs from "../schemas/bugreport.schema.js"

export const report_bug = async(req,res)=>{
    try {
        const {userName,userEmail,category,description,severity,title} = req.body;
        await bugs.create({
            userName:userName,
            userEmail:userEmail,
            category:category,
            description:description,
            severity:severity,
            title:title
        })
        console.log('Bug reported')
       return res.status(200).json({message:"Bug reported"})
    } catch (error) {
        console.log("Error in bug report function")
        return res.status(500).json({message:'Internal Server Error',error})
    }
}