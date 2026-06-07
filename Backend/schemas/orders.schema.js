import mongoose, { Schema } from "mongoose"


const orderSchema = mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    ordertype:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:["Pending","Executed","Cancelled"],
        default:"Pending"
    },
    createdAt:Date
})

const orders = mongoose.model("Orders" , orderSchema);
export default orders;