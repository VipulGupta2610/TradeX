import mongoose ,{Schema} from "mongoose"

const WatchlistSchema = mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
symbol:{
    type:String,
    required:true
},
addedon:Date
})

const watchlist = mongoose.model("Watchlist" , WatchlistSchema)
export default watchlist;