import mongoose from "mongoose";

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
    name:{
        type:String,
        required:true
    },
    exchange: {
        type: String,
        default: ""
    },
    ordertype:{
        type:String,
        enum: ["MARKET", "LIMIT", "SL", "SL-M"],
        required:true
    },
    side: {
        type: String,
        enum: ["BUY", "SELL"],
        required: true
    },
    product: {
        type: String,
        default: "MIS"
    },
    validity: {
        type: String,
        default: "DAY"
    },
    quantity:{
        type:Number,
        min: 0.00000001,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    marketPrice: {
        type: Number,
        required: true
    },
    executedPrice: {
        type: Number,
        default: null
    },
    status:{
        type:String,
        enum:["Pending","Executed","Cancelled"],
        default:"Pending"
    },
    executedAt: Date,
    cancelledAt: Date,
    
    // --- NEW: AI Prediction Metrics ---
    aiMetrics: {
        adx: { type: Number, default: null },
        macd: { type: Number, default: null },
        rsi: { type: Number, default: null },
        volume: { type: Number, default: null }
    }
}, { timestamps: true });

const orders = mongoose.model("Orders" , orderSchema);
export default orders;