import dotenv from "dotenv"
import connectDB from "./db/db.js";
import {app} from "./app.js"
dotenv.config({
    path:'./env'
})


connectDB() //connectDB is Async function so we can handle it like promise based
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log("App is listning on port:",process.env.PORT)
    })
})
.catch((err)=>{
    console.log("DB Connection errore !!!:",err)
})
