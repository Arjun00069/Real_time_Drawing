import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/ErrorHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"

const generateAxcessandRefressToken = async (userId)=>{
    try{
    const user = await User.findById(userId);
         const refreshToken = user.generateRefreshToken();
         const accesToken =user.generateAccesToken();
         user.refreshToken = refreshToken;
         await user.save({validateBeforeSave:false});
  
         return {refreshToken,accesToken};
        }
         catch(error){
            throw new ApiError(500,"Error in generating Access and refresh token")
         }
}
const register= asyncHandler(async(req,res,next)=>{
         const {user_name,password,email,fullName}=req.body;
           if([user_name,password,email,fullName].some(el=>el.trim()==="")){
            throw new ApiError(400,"All fields are required");
           }
       const exist_user = await User.findOne({$or:[{email},{user_name}]});
       if(exist_user){
        throw new ApiError(400,"User Already exist");
       }
         const user = await User.create({
            user_name:user_name.toLowerCase(),
            password,
            email,
            fullName
         })
         if(!user){
            throw new ApiError(500,"Something went wrong in creatin user");
         }
      return  res.status(200).json({
        message:"User created succefully",
       data: user
       })

})

const login = asyncHandler(async(req,res,next)=>{
    const {password,email,user_name:username}=req.body;
    if(!password){
        throw new ApiError(400,"Password required");
    }
    if(!email&&!username){
        throw new ApiError(400,"Email and username required");
    }

    const user = await User.findOne({$or:[{email},{user_name:username}]})
   if(!user){
    throw new ApiError(400,"User does not exist please register")
   }
   const isPasswordValid = await user.isPasswordCorrect(password);
   if(!isPasswordValid){
    throw new ApiError(401,"Invalid password");
   }
   const {refreshToken,accesToken}= await generateAxcessandRefressToken(user._id);
const newUser = await  User.findById(user._id,{password:0,refreshToken:0});
const options = {
    httpOnly:true,
    secure:true,
    sameSite: 'None',
}

res.status(200)
.cookie("accesstoken",accesToken,options)
.cookie("refreshtoken",refreshToken,options)
.json({
    data:newUser,
    message:"User Logged IN"
})
}
)

const logout = asyncHandler(async (req,res)=>{
    let user = req.user;
    if(!user){
        throw new ApiError(400,"user Already logged out");
    }
    let id= user._id;
    const newUser = await User.findByIdAndUpdate(id,{
        $set:{
            refreshToken:null
        }
    })
    const options ={
        httpOnly:true,
        secure:true
     }
      res.status(200).clearCookie("accesstoken",options)
      .clearCookie("refreshtoken",options).json({
        success:true,
        message:"Logged Out"
      })

})
const savepage = asyncHandler(async(req,res)=>{
    let user_id = req.user?._id;
    if(!user_id){
        throw new ApiError(401,"User not Logged in")
    }
    const {elements} = req.body;
    const updateUser= await User.findByIdAndUpdate(user_id,{
        $set:{
            elements:[...elements]
        }
    })
     if(!updateUser){
        throw new ApiError(500,"Error in saving current page");
     }
    res.status(200)
       .json({
        message:"Page Saved",
        data:elements
    })
})
const getElements = asyncHandler(async(req,res)=>{
    let user_id =req.user._id;
    if(!user_id){
        throw new ApiError(401,"Un authorized");
    }
    let user = await User.findById(user_id,{password:0,refreshToken:0});
    if(!user){
        throw new ApiError(404,"User not exist");
    }
    res.status(200)
    .json({
        elements:user.elements,
    })
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incommingRefreshToken = req.cookies.refreshtoken;
    if(!incommingRefreshToken){
        throw new ApiError(400,"unauthorized request");
    }
    const  {_id} = jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
       const user = await User.findById(_id);
       if(!user) {
        throw new ApiError(401,"Invalid Refresh TOken");
       }
       if(incommingRefreshToken===user.refreshToken){
        const {newRefreshToken,accesToken} = await user.generateAxcessandRefressToken();
        const options={
           httpOnly:true,
           secure:true
        }
        res.status(200)
        .cookie("accesstoke",accesToken,options)
        .cookie("refreshtoken",newRefreshTokenrefreshToken,options)
        .json({
            message:"Token generated succefully"
        })
       }else {
        throw new ApiError(401,"Invalid Refresh Token");
       }

   

})
export {login,register,refreshAccessToken,logout,savepage,getElements};