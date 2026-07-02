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
    product: {
        // MIS = intraday (leveraged, auto square-off), CNC = delivery
        type: String,
        enum: ["MIS", "CNC"],
        required: true
    },
    quantity:{
        type:Number,
        // Signed: positive = long, negative = intraday short. No min/max —
        // 0-quantity positions are deleted rather than stored.
        required:true
    },
    avgPrice:{
        type:Number,
        min: 0,
        required:true
    },
    marginBlocked: {
        // Only relevant for MIS positions: the cash actually locked away
        // (orderValue / LEVERAGE) as opposed to the full notional value.
        type: Number,
        min: 0,
        default: 0
    }
}, { timestamps: true });

// MIS and CNC are now separate books for the same symbol, so a user can
// hold a delivery position and an intraday position in the same stock
// independently (and so auto square-off only ever touches MIS).
positionSchema.index({ userid: 1, symbol: 1, product: 1 }, { unique: true });

const positions = mongoose.model("Positions" , positionSchema)
export default positions;