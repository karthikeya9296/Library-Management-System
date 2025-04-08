// --- START OF FILE Userdetasils.jsx ---

import React, { useEffect, useState } from 'react';
import { alluser, deleteUser } from '../../Services/Apis';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import Addmodal from '../Addmodal'; // Ensure path is correct

const MemoizedAddModal = React.memo(Addmodal);

export default function Userdetasils(props) {
  // Initialize state with an empty array
  const [user, setUser] = useState([]);
  const [addModal, setAddModal] = useState(false); // Not used currently?
  const [searchQuery, setSearchQuery] = useState('');

  const getusers = async () => {
    try {
        const res = await alluser(); // Expecting array or undefined/null
        // Ensure state is always an array, default to [] if res is falsy
        setUser(res || []);
    } catch (error) {
        console.error("Error fetching users:", error);
        setUser([]); // Set to empty array on error
    }
  };

  const deleteData = async (id) => {
     try {
        await deleteUser(id);
        getusers(); // Refetch users after successful deletion
     } catch (error) {
         console.error(`Error deleting user ${id}:`, error);
         // Optionally show an error message to the user
     }
  };

  // Remove 'user' from dependency array to prevent infinite loop
  useEffect(() => {
    getusers();
  }, []); // Empty array means run once on mount

  const filteredUsers = user.filter((user) => // Filter the state array directly
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.mobile.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.address?.toLowerCase().includes(searchQuery.toLowerCase()) // Optional chaining for address
  );

  return (
    <>
      <div className='user-container'>
        <div className="dashboard-header">
          <h1>Members List</h1>
          <MemoizedAddModal datares={false} submitres="1" formresponse={true} title="Add User" role="add" headertitle=" Add user details" field1="Full Name" field2="Email Address" field3="Mobile" field4="Address" />
        </div>
        <div className="search">
          <div className="search-container">
            {/* Search input JSX... ensure class names are correct */}
             <input checked="" className="checkbox" type="checkbox"/>
             <div className="mainbox">
                 <div className="iconContainer">
                     <svg viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="search_icon"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path></svg>
                 </div>
                 <input className="search_input" placeholder="search" type="text" value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} />
             </div>
          </div>
        </div>
        <table className="table-dashboard">
          <thead> {/* Added thead for semantics */}
             <tr>
                <th>SL</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Address</th>
                <th>Actions</th>
             </tr>
          </thead>
          <tbody> {/* Added tbody */}
             {/* Check if filteredUsers exists and has items before mapping */}
             {filteredUsers && filteredUsers.length > 0 ? (
                 filteredUsers.map((userItem, index) => ( // Use different var name like userItem
                 <tr key={userItem.id}> {/* Use the unique ID from your data */}
                    <td>{index + 1}</td>
                    <td>{userItem.name}</td>
                    <td>{userItem.email}</td>
                    <td>{userItem.mobile}</td>
                    <td>{userItem.address || 'N/A'}</td> {/* Handle potentially null address */}
                    <td className='action'>
                       {/* Check data1-4 use userItem */}
                       <MemoizedAddModal datares={true} res={true} formresponse={true} btnres={true} role="view" headertitle="Member details"
                           field1="Full Name" field2="Email Address" field3="Mobile" field4="Address"
                           data1={userItem.name} data2={userItem.email} data3={userItem.mobile} data4={userItem.address} />
                       <MemoizedAddModal datares={true} res={true} formresponse={true} btnres={false} id={userItem.id}
                           title="Edit User" role="editUser" headertitle=" Edit user details"
                           field1="Full Name" field2="Email Address" field3="Mobile" field4="Address"
                           data1={userItem.name} data2={userItem.email} data3={userItem.mobile} data4={userItem.address} />
                       <Link className='btn2'
                           style={{ marginRight: "5%", paddingRight: "20px", paddingLeft: "20px" }}
                           onClick={() => deleteData(userItem.id)} // Pass userItem.id
                       >
                          <DeleteIcon />
                       </Link>
                    </td>
                 </tr>
                 ))
             ) : (
                 <tr>
                    <td colSpan="6"> {/* Adjust colSpan based on number of columns */}
                        {user.length === 0 ? "No users found." : "Loading..."} {/* Show appropriate message */}
                    </td>
                 </tr>
             )}
          </tbody>
        </table>
      </div>
    </>
  );
}
// --- END OF FILE Userdetasils.jsx ---