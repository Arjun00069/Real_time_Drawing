import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/ErrorHandler.js";
import jwt from "jsonwebtoken"


export const isAuthenticated = asyncHandler(async(req,res,next)=>{
    try{
    let incommingAxcessToken = req.cookies?.accesstoken|| req.header("Authorization").split(' ')[1];

        if(!incommingAxcessToken){
            throw new ApiError(401,"Unauthorized request");
        }
        const tempUser = jwt.verify(incommingAxcessToken,process.env.ACCESS_TOKEN_SECRET);
        const {_id}=tempUser;
        const user = await User.findById(_id,{password:0,refreshToken:0});
        if(!user){
            throw new ApiError(401,"Invalid axcess token");
        }
        req.user= user;
      next();}
      catch(error){
        throw new ApiError(401,error?.message||"Invalid Access Token");
      }
})
