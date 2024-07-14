
import './App.css';
import Canvas from './pages/Canvas';
import { BrowserRouter as Router , Routes, Route } from "react-router-dom";
import Register_form from './pages/Register_form';

import { useState,createContext ,useEffect} from 'react';
import Create_Room from './pages/Room/Create_Room';
import Login_canva from './pages/Login/Login_canva';
import { connecttoRoom } from './util/roomLogic';
import Landingpage from './pages/landingpage/Landingpage';
export const contextApi=createContext(0);
function App() {
  const [isLoggedin,setIsLoggedIn]=useState(false);
  const [isinRoom,setIsinRoom]=useState(false);
  const [roomeElements,setRoomElements]=useState([]);
  const[roomindex,setRoomIndex]=useState(0);

    
  useEffect(()=>{
    if(localStorage.getItem('currentRoom')){
      const data = JSON.parse(localStorage.getItem('currentRoom'));
    const room_id=data.room_id;
  
      connecttoRoom (room_id);

    }
if(localStorage.getItem('isLoggedIn')){
  setIsLoggedIn(true);
}
if(localStorage.getItem('currentRoom')){
  setIsinRoom(true);
}
},[])

  
  return(
    <contextApi.Provider value={{isLoggedin,setIsLoggedIn,isinRoom,setIsinRoom,roomeElements,setRoomElements,roomindex,setRoomIndex}}>
   <Router>
<Routes>
  <Route path='/canvas' element={<Canvas/>}/>
  <Route path='/register' element={<Register_form/>}/>

  <Route path='/room' element={<Create_Room/>}/>
  <Route path='/login' element={<Login_canva/>}/>
  <Route path='/' element={<Landingpage/>}/>
</Routes>
   </Router>
   </contextApi.Provider>
  );
  
}

export default App;
