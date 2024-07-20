import { Room } from "../models/room.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/ErrorHandler.js";

const createRoom = asyncHandler(async(req,res)=>{
     const {roomName,user_name,password} =req.body;
    
     if([roomName,user_name,password].some(el=>el.trim()==="")){
        throw new ApiError(400,"Credentials are required for creation of room");
     } 
     let user = await User.findOne({user_name:user_name},{refreshToken:0});
     if(!user){
        throw new ApiError(400,"Register to create room");
     }
     const isPasswordValid = await user.isPasswordCorrect(password);
     if(!isPasswordValid){
        throw new ApiError(400,"Enter corect password");
     }
    const room ={
     room_name:roomName,
     elements:[],
     admin:user._id
    } 
    const created_room =await Room.create(room);
    res.status(200).json({
        message:"Room created",
        room:created_room
    })
})
const deleteRoom = asyncHandler(async (req,res)=>{
   const {room_id,username,password} =req.body;
   let user = await User.findOne({user_name:username},{refreshToken:0});
   if(!user){
      throw new ApiError(400,"Register to create room");
   }
   const isPasswordValid = await user.isPasswordCorrect(password);
   if(!isPasswordValid){
      throw new ApiError(400,"Enter corect password");
   }
     const deleteRoom = await Room.deleteOne({room_id});
     if(deleteRoom.deletedCount>0){
      return   res.status(200).json({
            message:"Room deleted",
            succss:true
        })
     }else{
        throw new ApiError(500,"Error in deltion of room");
     }
})
const updateRoom = asyncHandler(async(req,res)=>{
    const {elements,room_id,index} = req.body;
    const updateRoom = await Room.updateOne({room_id},{
        $set:{
            elements:elements,
            index:index
        }
    })
    if(updateRoom.matchedCount>0){
    
        res.status(200).json({
            message:"Updated",
            succss:true
        })
    
    }else{
        throw new ApiError(401,"Room does not exist");
    }

})

const jointRoom = asyncHandler(async(req,res)=>{
    const url = req.url;
    const room_id = url.split('?')[1].split('=')[1];
    if(!room_id){
        throw new ApiError(400,"Not a valid room_id");
    }
    const room = await Room.findOne({room_id});
    if(!room){
        throw new ApiError(404,"room does not exist");
    }
    res.status(200).json({
        succss:true,
        room
    })
})

const getElementsRoom = asyncHandler(async(req,res)=>{
    const query_string = req.url?.split('?')[1];
    const room_id = query_string?.split('=')[1];

        if(!room_id){
        throw new ApiError(401,"Invaldi room id please join room");
    }
    const room = await Room.findOne({room_id});
  
    if(!room){
        throw new ApiError(500,"Error in finding room");
    }
    res.status(200).json({
         room
    })
})
export {createRoom,deleteRoom,updateRoom,jointRoom,getElementsRoom};