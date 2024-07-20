import axios from 'axios';
import React, { useState,useContext, useEffect } from 'react'
import { server } from '../..';
import { json, useNavigate } from 'react-router-dom';
import { contextApi } from '../../App';
import { connecttoRoom } from '../../util/roomLogic';
import { socket } from '../../socket';
const Joinroom = () => {
    const [room_id,setRoom_is] =useState("");
    const[userName ,setuserName ]=useState("") 
  const [password,setPasssword] =useState("");

    const[joinroom,setJoinRoom]=useState(true);
  

    const history = useNavigate();
    const {setRoomElements,setIsinRoom,isinRoom,setRoomIndex}=useContext(contextApi);
    useEffect(()=>{
    if(isinRoom){
        history('/canvas');
    }
    },[isinRoom])
    const joinRoom= async (e)=>{
    e.preventDefault();
    if(joinroom){
    try {
        // hit endpoint get details of room and then open canvas
        if(room_id.trim()===""){
            alert("Room id is required");
            return;
        }
         const {data} = await axios.get(`${server}/draw/room/joinroom?room_id=${room_id}`);
                    if(data.room){
                      setRoomElements([...data?.room?.elements]);
                      setRoomIndex(data?.room?.index);
                    }
                    localStorage.setItem('currentRoom',JSON.stringify({admin_id:data.room.admin,room_id:data.room.room_id}));
                    connecttoRoom(data.room.room_id);
                    // socket.connect();
                   setIsinRoom(true);
                   setRoom_is("");
                    history('/canvas');
    } catch (error) {
        console.log(error)
        setRoom_is("");
      alert(error?.response?.data?.message);
    }
  }else{
    console.log(room_id,userName,password);
    try {
      if(room_id==""){
        alert("room_id is required");
        return;
      }
      else if(userName.trim()===""||password.trim()==""){
        alert("Enter Details");
        return ;
      }
      const config = {
        headers: {
            'Content-Type': 'application/json',
        },
        withCredentials: true, // Send cookies with the request
    };
      const {data} = await axios.post(`${server}/draw/room/deleteroom`,{room_id,username:userName,password},config);
      setPasssword("");
      setRoom_is("");
      setuserName("");
      alert(data.message);
    } catch (error) {
      console.log(error)
      alert(error?.response?.data?.message);
    }
    return
  }
    }
  return (
  <>
  
  
        <form onSubmit={(e)=>{joinRoom(e)}}>
           <h2> {joinroom?"Join Room":"Delete Room"}</h2>
           <div class="input-field">
            <input type="text" id='room_id' value={room_id} onChange={(e)=>setRoom_is(e.target.value)} />
            <label >Enter room id</label>
       </div>
    {  !joinroom&& <div class="input-field">
            <input type="text" id='room_id' value={userName} onChange={(e)=>setuserName(e.target.value)} />
            <label >Enter user name</label>
       </div>}
    {!joinroom&&   <div class="input-field">
            <input type="password" id='room_id' value={password} onChange={(e)=>setPasssword(e.target.value)} />
            <label >Enter password</label>
       </div>}
            
    {joinroom&&   <button className='submitbtn' type="submit">Join</button>}
   {!joinroom   && <button className ='submitbtn'  onClick={()=>setJoinRoom(!joinroom)}>Join Room</button>}
   {! joinroom && <button id='submitbtn' type="submit" >Delete </button>}

   {joinroom&&   <button className='submitbtn'onClick={()=>setJoinRoom(!joinroom)} >Delete room </button>}
        </form>

        </>

  )
}

export default Joinroom
