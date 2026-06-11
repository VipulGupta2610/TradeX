import mongoose from "mongoose";

const positionSchema = mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required:true
    },
    symbol:{
        type:String,
        required:true
    },
    name: {
        type: String,
        default: ""
    },
    exchange: {
        type: String,
        default: ""
    },
    quantity:{
        type:Number,
        min: 0,
        required:true
    },avgPrice:{
        type:Number,
        min: 0,
        required:true
    }
}, { timestamps: true });

positionSchema.index({ userid: 1, symbol: 1 }, { unique: true });

const positions = mongoose.model("Positions" , positionSchema)
export default positions;
