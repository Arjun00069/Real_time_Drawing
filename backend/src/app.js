import express from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.json())
app.use(express.urlencoded({extended:true})) // For extended tue we can give nested objects
app.use(express.static("public"))
app.use(cookieParser())//This middle ware is responsible for crud operation on cookie from server side

app.get('/',(req,res)=>{
    res.send('servrer is working')
})


export {app};