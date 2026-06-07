import mongoose , {Schema} from "mongoose";

const tradesScehma = mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    symbol:{
        type:String,
        required:true
    },
    buyprice:{
        type:Number,
        required:true
    },
    sellprice:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    prfitnloss:{
        type:String,
        required:true
    },
    openedAt:{
        type:Date,
        required:true
    },
    closedAt:{
        type:Date,
        required:true
    }
})

const trades = mongoose.Schema("Trades" , tradesScehma)
export const trades;