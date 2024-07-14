import dotenv from "dotenv"
import connectDB from "./db/db.js";
import {Server} from "socket.io"
import {createServer} from "http"
import {app} from "./app.js"
import { Socket } from "dgram";
dotenv.config({
    path:'./env'
})


connectDB()
    .then(() => {
        const httpServer = createServer(app);
        const io = new Server(httpServer, {
            pingTimeout: 60000,
            cors: {
                origin: "http://localhost:3000"
            }
        });

        io.on('connection', (socket) => {
            // console.log(`A person connected with socket id ${socket.id}`);
            socket.on("elements",(data)=>{
                const room_id =data.room_id;
                const elements=data.elements;
                socket.to(room_id).emit("comming_elements",{elements,index:data.index});
            })
            //joining room
            socket.on("join-room",(room_id)=>{
                socket.join(room_id);
                // console.log(`user joinde ${room_id}`);
            })
            socket.on("selection",(data)=>{
                // console.log(data);
                socket.to(data.room_id).emit("selection",{element:data.elements});
            })
           
        });

        httpServer.listen(process.env.PORT || 8000, () => {
            console.log("App is listening on port:", process.env.PORT || 8000);
        });
    })
    .catch((err) => {
        console.log("DB Connection error:", err);
    });
