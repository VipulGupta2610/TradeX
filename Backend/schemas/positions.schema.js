import mongoose , {Schema} from "mongoose";

const positionSchema = mongoose.Schema({
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    symbol:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },avgPrice:{
        type:Number,
        required:true
    }

})

const positions = mongoose.model("Positions" , positionSchema)
export default positions;