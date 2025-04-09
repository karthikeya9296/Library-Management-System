// import React, { useEffect, useState } from 'react'
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Sidebar from './Sidebar/Sidebar'
// import Dashboard from './Dashboard'
// import Userdetasils from './Users/Userdetasils'
// import Bookdetails from './Books/Bookdetails';
// import Openrecords from './Records/Openrecords';
// import Closedrecords from './Records/Closedrecords';
// import Signin from './Admin/Signin';
// import Addmodal from './Addmodal';
// import App from '../App';

// const Body = () => {
//     const [isSignedIn, setIsSignedIn] = useState(false);
//     useEffect(() => {
//         // Check if user is signed in
//         const signedIn = localStorage.getItem("islogin");
//         if (signedIn) {
//             setIsSignedIn(true);
//         }
//     }, []);
//   return (
//         <Router>
//                       {isSignedIn && <div className="sidebar col"> <Sidebar/></div>}

//         <Routes>
//         <Route path="/" element={<Signin/>}/>
//     <Route path="/dashboard" element={<Dashboard/>}/>
//     <Route path="/user" element={<Userdetasils/>}/>
//     <Route path="/books" element={<Bookdetails/>}/>
//     <Route path="/closedrecords" element={<Closedrecords/>}/> 
//     <Route path="/openrecords" element={<Openrecords/>}/>
//     <Route path="/test" element={<Addmodal/>}/>
//             </Routes>
//         </Router>
//     )
// }

// export default Body
