import mongoose from "mongoose"

const bugSchema = mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    userEmail:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    severity:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
})

const bugs = mongoose.model("Bug",bugSchema);
export default bugs;