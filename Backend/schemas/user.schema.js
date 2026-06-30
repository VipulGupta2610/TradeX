import mongoose , {Schema} from "mongoose";

const userSchema = mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        required:true
    },
    isPass:{
        type:Boolean,
        required:true,
        default:true
    },
    password:{
        type:String,
        required:function (){
            return this.isPass == true
        }
    },
      plan: {
    type: String,
    default: "free"
  },

  virtualBalance: {
    type: Number,
    default: 100000
  },

  totalPortfolioValue: {
    type: Number,
    default: 100000
  },

  createdAt: Date
},{timestamps:true})

const user = mongoose.model("Users" , userSchema);
export default user;