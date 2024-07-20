
import { socket } from "../socket"
const connecttoRoom =(room_id)=>{
    console.log("skjdfw");
    socket.connect();
    socket.emit("join-room",room_id);
}

const deleteRoom =async(leaveroom)=>{


    leaveroom();
}
export{connecttoRoom,deleteRoom}