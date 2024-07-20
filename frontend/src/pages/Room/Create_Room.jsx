import React, { useState } from 'react'
import Joinroom from './Joinroom'
import axios from 'axios';
import { server } from '../..';
import { useContext } from 'react';
import { contextApi } from '../../App';
import { connecttoRoom } from '../../util/roomLogic';
import { useNavigate } from 'react-router-dom';
const Create_Room = () => {
  const history =useNavigate();
  const [joinroom,setJoinRoom ]=useState(false);
  const [deleteroom , setDeleteRoom ]=useState(false);
  const [roomName,setRoomName] =useState("");
  const[userName ,setuserName ]=useState("") 
  const [password,setPasssword] =useState("");
  const {setIsinRoom,  setRoomElements,setRoomIndex} =useContext(contextApi);
   const roomJoinHandler =async(e)=>{
         e.preventDefault();
         if([password,roomName,userName].some(el=>el.trim()==="")){
          alert("Enter full Information");
          return ;
         }
         try {
          const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Send cookies with the request
        };
          const {data}=  await axios.post(`${server}/draw/room/createroom`,{roomName,user_name:userName,password},config)
          if(data.room){
            setRoomElements([...data?.room?.elements]);
            setRoomIndex(data?.room?.index);
          }
          localStorage.setItem('currentRoom',JSON.stringify({admin_id:data.room.admin,room_id:data.room.room_id}));
          connecttoRoom(data.room.room_id);
          // socket.connect();
         setIsinRoom(true);
          history('/canvas');
         } catch (error) {
          setPasssword("");
          setuserName("")
          setRoomName("");
          if(error?.response?.data?.message) alert(error?.response?.data?.message);
          else alert(error.message);
          }
  }
  return (
    <>
     
    <div className="login_body">
     <div class="wrapper">
      <div className="btns" style={{display:"flex"}}>
     <button id='submitbtn' style={{padding:"0"}} onClick={()=>{
      setJoinRoom(!joinroom);
     }}> {!joinroom?"Join Room":"Create Room"}</button>
      
     </div>
         {!joinroom? 
  
  <form onSubmit={roomJoinHandler}>
    <h2>Create Room</h2>
    <div class="input-field">
      <input type="text" value={roomName} onChange={(e)=>{
       setRoomName(e.target.value);
      }} />
      <label>Enter your room name</label>
    </div>
      <div class="input-field">
      <input type="text" value={userName} onChange={(e)=>{
       setuserName(e.target.value);
      }}   />
      <label>Enter your user name</label>
    </div>
    <div class="input-field">
      <input type="password" value={password} onChange={(e)=>{
       setPasssword(e.target.value);
      }} />
      <label>Enter your password</label>
    </div>
    <button id='submitbtn' type="submit">Create Room</button>
   
  </form>:<Joinroom/>}
  

</div>
   
   </div>
   </>
  )
}

export default Create_Room
