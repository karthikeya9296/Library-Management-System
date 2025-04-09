import React, { useState } from 'react'
import PersonIcon from '@mui/icons-material/Person';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { Link, redirect } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Navigate} from 'react-router-dom'


export default function Sidebar() {

  const handleLogOut=()=>{
    localStorage.removeItem("userid")
    localStorage.removeItem("isLoggedIn")
    if(!localStorage.getItem("isLoggedIn")){
window.location.reload()   }

    
  }
  return (

  <div className='sidebar col'>
    <div className="dashHeader"><LibraryBooksIcon/><h4> Library</h4> </div>

        <div  className="head row">
            <ul className='admin_items'>
                <li className='a_icon'>
                        <PersonIcon/>
                </li>
                <li className='A_title'>ADMIN</li>

                 <button onClick={handleLogOut} > Log Out</button>
            </ul>
        </div>
    <ul className='SidebarList'>
    {/* {Sidebardata.map((val,key)=>{

return(
    <li key={key} 
    className='row' 
    onClick={()=>{setDashId(val.link)}}
    >
      {console.log(dashId)}
        <div >{val.icon}</div>
        <div className='tt'>{val.title}</div>
     </li>
)
})} */}
      <Link to={"/"}> <li className="row"><DashboardIcon/> Dashboard</li></Link>
      <Link to={"/user"}>  <li className="row"><AccountCircleIcon/> Users</li></Link>
      <Link to={"/books"}><li className="row"><MenuBookIcon/> Books</li></Link>
      <Link to={"/openrecords"}><li className="row"><ReceiptLongIcon/> Open Records</li></Link> 
      <Link to={"/closedrecords"}><li className="row"><ReceiptLongIcon/> Closed Records</li></Link>

    </ul>
    
    </div>


  )
}
