import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { server } from "..";
import { contextApi } from "../App";
import { socket } from "../socket";
export const useHistory = initialState => {
    const [index, setIndex] = useState(0);
    const [history, setHistory] = useState([initialState]);
    const {isLoggedin,setIsLoggedIn,isinRoom}=useContext(contextApi);
    useEffect(() => {
      if (isinRoom) {
       
        
        // Emitting "elements" event to the socket
      
    
        // Define your event handler functions
      
    
        const handleComingElements = (data) => {
          console.log(data);
          if (data?.elements?.length > 0) {
          setHistory(data.elements);
          setIndex(data.index);
          console.log("dfe");
          }
        };
        socket.on("comming_elements", handleComingElements);
    

        return () => {
 
          socket.off("comming_elements", handleComingElements);
        };
      }
    }, [isinRoom]);
  
    const setState = (action, overwrite = false) => {
        //  console.log(history);
      const newState = typeof action === "function" ? action(history[index]) : action;
      if (overwrite) {
    
        const historyCopy = [...history];
        historyCopy[index] = newState;
  
        setHistory(historyCopy);
        if(isinRoom){
          let room = JSON.parse(localStorage.getItem('currentRoom'));
          socket.emit("elements",{elements:historyCopy,index:index,room_id:room?.room_id});
         }
        
      } else {
        const updatedState = [...history].slice(0, index + 1);
        // console.log([...updatedState, newState]);
        setHistory([...updatedState, newState]);
        setIndex(prevState => prevState + 1);
        if(isinRoom){
          let room = JSON.parse(localStorage.getItem('currentRoom'));
          socket.emit("elements",{elements:[...updatedState, newState],index:index+1,room_id:room?.room_id});
         }
      }
      
    };
  
    const undo = () =>{
        if(index>0){ setIndex(prevIndex=>prevIndex-1);
          if(isinRoom){
            let room = JSON.parse(localStorage.getItem('currentRoom'));
            socket.emit("elements",{elements:history,index:index-1,room_id:room?.room_id});
           }
        }
    };
    const redo = () =>{ if(index < history.length - 1) {setIndex(prevState => prevState + 1);
      if(isinRoom){
        let room = JSON.parse(localStorage.getItem('currentRoom'));
        socket.emit("elements",{elements:history,index:index+1,room_id:room?.room_id});
       }
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
            console.log(error?.response?.message);
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
     
    return [history[index], setState, undo, redo,save,logout];
  };