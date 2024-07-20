import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { server } from "..";
import { contextApi } from "../App";
import { socket } from "../socket";
const fetchRoomData =async()=>{
try {
  const room_id = JSON.parse(localStorage.getItem('currentRoom')).room_id;
  const {data} = await axios.get(`${server}/draw/room/getroom?room_id=${room_id}`);
    const {index,elements} =data.room;
               return {index,elements};
} catch (error) {
  alert(error?.response?.data?.message);
}
}
export const useHistory = initialState => {
    const [index, setIndex] = useState(0);
    const [history, setHistory] = useState([initialState]);
    const {isLoggedin,setIsLoggedIn,isinRoom, setRoomElements,setRoomIndex, setIsinRoom}=useContext(contextApi);
     useEffect(()=>{
       if(isinRoom){
           fetchRoomData().then((data)=>{
            const {index,elements}= data      
               setRoomElements(elements);
          setRoomIndex(index);
          setHistory(elements);
          setIndex(index);
           }).catch((err)=>{
            console.log(err);
           })
         
       }
     },[isinRoom])
    useEffect(() => {
      if (isinRoom) {
        console.log('p')
        const handleComingElements = (data) => {
      
          if (data?.elements?.length > 0) {
          setHistory(data.elements);
          setIndex(data.index);
      
          }
        };
        socket.on("comming_elements", handleComingElements);
    

        return () => {
 
          socket.off("comming_elements", handleComingElements);
        };
      }
    }, [isinRoom]);
  
    const setState = async (action, overwrite = false) => {
        //  console.log(history);
      const newState = typeof action === "function" ? action(history[index]) : action;
      if (overwrite) {
    
        const historyCopy = [...history];
        historyCopy[index] = newState;
  
        setHistory(historyCopy);
        if(isinRoom){
          let room = JSON.parse(localStorage.getItem('currentRoom'));
          socket.emit("elements",{elements:historyCopy,index:index,room_id:room?.room_id});
          try {
            const config = {
              headers: {
                  'Content-Type': 'application/json',
              },
              withCredentials: true, // Send cookies with the request
          };
            const data = await axios.post(`${server}/draw/room/updateroom`,{elements:historyCopy,index,room_id:room?.room_id},config)
          } catch (error) {
            alert(error?.response?.message);
          }
         }
        
      } else {
        const updatedState = [...history].slice(0, index + 1);
        // console.log([...updatedState, newState]);
        setHistory([...updatedState, newState]);
        
        if(isinRoom){
          let room = JSON.parse(localStorage.getItem('currentRoom'));
          socket.emit("elements",{elements:[...updatedState, newState],index:index+1,room_id:room?.room_id});
          try {
            const config = {
              headers: {
                  'Content-Type': 'application/json',
              },
              withCredentials: true, // Send cookies with the request
          };
            const data = await axios.post(`${server}/draw/room/updateroom`,{elements:[...updatedState, newState],index:index+1,room_id:room?.room_id},config)
          } catch (error) {
            alert(error?.response?.data?.message);
          }
         }
         setIndex(prevState => prevState + 1);
      }
    
      
    };
  
    const undo = async () =>{
        if(index>0){ 
          if(isinRoom){
            let room = JSON.parse(localStorage.getItem('currentRoom'));
            socket.emit("elements",{elements:history,index:index-1,room_id:room?.room_id});
            try {
              const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true, // Send cookies with the request
            };
              const data = await axios.post(`${server}/draw/room/updateroom`,{elements:history,index:index-1,room_id:room?.room_id},config)
            } catch (error) {
              alert(error?.response?.data?.message);
            }
           }
           setIndex(prevIndex=>prevIndex-1);
        }
    };
    const redo = async() =>{ if(index < history.length - 1) {
      if(isinRoom){
        let room = JSON.parse(localStorage.getItem('currentRoom'));
        socket.emit("elements",{elements:history,index:index+1,room_id:room?.room_id});
        try {
          const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Send cookies with the request
        };
          const data = await axios.post(`${server}/draw/room/updateroom`,{elements:history,index:index+1,room_id:room?.room_id},config)
        } catch (error) {
          alert(error?.response?.data?.message);
        }
       }
       setIndex(prevState => prevState + 1);
    }
    }
     const save =async ()=>{
      if(!isLoggedin){
        alert("Please login to save");
      return ;
      }
        let newHistory =[];
        newHistory.push([]);
        newHistory.push(history[index]);
          setIndex(1);
          setHistory(newHistory);
          try {
            const elements=[...history[index]];
            const config = {
              headers: {
                  'Content-Type': 'application/json',
              },
              withCredentials: true, // Send cookies with the request
          };
            const {data}= await axios.post(`${server}/draw/user/save`,{elements},config);

          } catch (error) {
            console.log(error?.response?.data?.message);
          }
     }
     const logout = async()=>{
      try { 
        const config = {
          headers: {
              'Content-Type': 'application/json',
          },
          withCredentials: true, // Send cookies with the request
      };
        const {data} = await axios.get(`${server}/draw/user/logout`,config);
        if(data.success){
          setIsLoggedIn(false);
          localStorage.removeItem('isLoggedIn');
           let newHistory=[];
           newHistory.push([]);
          //  console.log(newHistory);
          setIndex(0);
            setHistory(newHistory);
        
        }
        
      } catch (error) {
        alert(error?.response?.data?.message)
      }
     }
     const leaveRoom =()=>{
      socket.disconnect();
      localStorage.removeItem('currentRoom');
      setRoomElements([]);
      setRoomIndex(0);
      setIndex(0);
      let p=[];
      p.push([]);
      setHistory(p);
      setIsinRoom(false);
     
     }
      //  console.log(history);
    return [history[index], setState, undo, redo,save,logout,leaveRoom];
  };