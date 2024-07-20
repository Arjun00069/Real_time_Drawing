import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
    user_name:{
        type:String,
        required:true,
        trim:true,
        index:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    }, fullName: {
        type: String,
        required: true,
        trim: true, 
    },
    password:{
        type:String,
        required:true,
    },
    elements:[],
    refreshToken: {
        type: String
    }
},{
    timestamps:true
});

userSchema.pre("save",async function(next){
    if (!this.isModified('password')) return next();

     this.password= await bcrypt.hash(this.password,10)
     next();
})
userSchema.methods.generateAccesToken=  function(){
    const token =jwt.sign({
     _id:this._id,
     email:this.email,
     username:this.username,
     fullName:this.fullName
    },process.env.ACCESS_TOKEN_SECRET,{
   expiresIn: process.env.ACCESS_TOKEN_Expiry
 })

 return token
 
}

userSchema.methods.generateRefreshToken=  function (){
 return jwt.sign({
     _id:this._id
 }, process.env.REFRESH_TOKEN_SECRET,
 {
     expiresIn:process.env.REFRESH_TOKEN_EXPIRY
 }
 )
}
userSchema.methods.isPasswordCorrect= async function(password){
    
    return await bcrypt.compare(password,this.password)
}

export const User = mongoose.model("User",userSchema)