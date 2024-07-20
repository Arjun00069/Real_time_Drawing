import React, { useContext, useEffect, useState } from 'react'
import './Login_canva.css'
import { contextApi } from '../../App';
import axios from 'axios';
import { server } from '../..';
import { Link, useNavigate } from 'react-router-dom';
const Login_canva = () => {



  const {isLoggedin,setIsLoggedIn}=useContext(contextApi);

  const history =useNavigate();
    const [email_user,setEmail] = useState("");
    const [password,setPassword]=useState("");
    useEffect(()=>{
     if(isLoggedin){
      history('/canvas')
     }
    },[isLoggedin])
    const handleSubmit =async (e)=>{
            e.preventDefault();
            try {
              const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true, // Send cookies with the request
            };
           const {data} = await axios.post(`${server}/draw/user/login`,{user_name:email_user,password},config);
           localStorage.setItem('isLoggedIn','true');
           setIsLoggedIn(true);
                history('/canvas')
            } catch (error) {
              setEmail("");
              setPassword("");
              if(error?.response?.data?.message)alert(error?.response?.data?.message)
              else alert("Network error");
            }
           
    
    }
  return (
    <div className="login_body">
   <div class="wrapper">
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
        <div class="input-field">
        <input type="text"  value={email_user} onChange={(e)=>{setEmail(e.target.value)}} />
        <label>Enter your user name</label>
      </div>
      <div class="input-field">
        <input type="password"  value={password} onChange={(e)=>setPassword(e.target.value)}/>
        <label>Enter your password</label>
      </div>
      
      <button id='submitbtn' type="submit">Log In</button>
      <div class="register">
        <p>Don't have an account?<Link to="/Register">Register</Link></p>
        <p>Use as a guest:<Link to="/canvas">Draw</Link> </p>
      </div>
      
    </form>
  </div>
  </div>
  )
}

export default Login_canva
