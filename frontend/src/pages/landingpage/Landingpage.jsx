import React from 'react'
import './landingpage.css'
import Create_Room from '../Room/Create_Room'
import Login_canva from '../Login/Login_canva'
const Landingpage = () => {
  return (
    <div className="landingpage_body">
       <header>
       <span>Draw Ease</span>
       </header>
       <div className="rest_body">
       <div className="room_menu"><Create_Room/></div>
       <div className="loging_menu"><Login_canva/></div>
       </div>
    </div>
  )
}

export default Landingpage
