import { redis } from "../index.js"

export const Limiter = async (req , res ,next)=>{
    try {
        const {email} = req.body;
        const key = `rate_limit:${email}`
        const request =await redis.incr(key)
        if (request == 1){
            await redis.expire(key,180)
        }
        if (request>10){
            res.status(429).json({message:"Too many requests"})
        }
        next();
    } catch (error) {
        console.log("Error at Limiter")
        console.log(error)
    }
}