import mongoose from "mongoose";
const generateUnique_id =()=>{
    const randomPart = Math.random().toString(36).substr(2, 9);
    const timestamp = Date.now();
    const uniqueId = randomPart + '-' + timestamp;
    return uniqueId;
}
const roomSchema = new mongoose.Schema({
    room_id:{
   type:String,
   default:generateUnique_id(),
   unique:true
    },
    room_name:{
        type:String,
        required:true,
        trim:true
    },
    index:{
        type:Number,
        default:0
    },
    elements:[],
    admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
})


export const Room = mongoose.model("Room",roomSchema);