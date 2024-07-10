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
    console.log(req.ip)
    res.send('servrer is working')
})
import userRoutes from "./routes/user.routes.js";
import roomRoutes from "./routes/room.routes.js"
app.use('/draw/user',userRoutes);
app.use('/draw/room',roomRoutes);


app.use((err, req, res, next) => {
    // console.log(err.message)
    if (!err.message) err.message = "Something went wrong"
    if (!err.statusCode) err.statusCode = 400
    return res.status(err.statusCode).json({ success: false, message: err.message });
})

export {app};