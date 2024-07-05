import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB =async ()=>{
    try {
       const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
       console.log(`Data base connected Connection Host:${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MONGO DB Connection Error !!!:",error)
        // throw error // or we ca exit 
        process.exit(1)
    }
}
export default connectDB;