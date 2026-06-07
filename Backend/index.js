import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import cors from "cors"
import { Server } from "socket.io";
import http from "http";

const app = express()

import userRoutes from "../Backend/routes/user.route.js"
import marketRoutes from "../Backend/routes/market.route.js"

dotenv.config()

import { startMarketData } from "./services/marketDataService.js"
const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173"
    }
});
startMarketData(io)

app.use(cors({
    origin:["http://localhost:5173", "http://localhost:5174/"],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))

const url = process.env.mongodb_uri
const PORT = process.env.port

app.use(express.json())

try {
    mongoose.connect(url)
    console.log("Mongodb connected")
} catch (error) {
    console.log("Error at mongodb connection")
    console.log(error)
}

app.use("/user" , userRoutes)
app.use("/markets",marketRoutes)

try {
    server.listen(PORT,()=>{
        console.log("Server is listening on port ",PORT)
    })
} catch (error) {
    console.log("Error at port connecting")
    console.log(error)
}