
import './App.css';
import Canvas from './pages/Canvas';
import { BrowserRouter as Router , Routes, Route } from "react-router-dom";
import Register_form from './pages/Register_form';
import Login from './pages/Login';
import { useState,createContext ,useEffect} from 'react';
export const contextApi=createContext(0);
function App() {
  const [isLoggedin,setIsLoggedIn]=useState(false);

  useEffect(()=>{
if(localStorage.getItem('isLoggedIn')){
  setIsLoggedIn(true);
}
},[])

  
  return(
    <contextApi.Provider value={{isLoggedin,setIsLoggedIn}}>
   <Router>
<Routes>
  <Route path='/canvas' element={<Canvas/>}/>
  <Route path='/register' element={<Register_form/>}/>
  <Route path='/login' element={<Login/>}/>

</Routes>
   </Router>
   </contextApi.Provider>
  );
  
}

export default App;
