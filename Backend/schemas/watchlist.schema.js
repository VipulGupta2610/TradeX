import mongoose from "mongoose";

const WatchlistSchema = mongoose.Schema({
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
    type: {
        type: String,
        default: "Stocks"
    },
    exchange: {
        type: String,
        default: ""
    }
}, { timestamps: true });

WatchlistSchema.index({ userid: 1, symbol: 1 }, { unique: true });

const watchlist = mongoose.model("Watchlist" , WatchlistSchema)
export default watchlist;
