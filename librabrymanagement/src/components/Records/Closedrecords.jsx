// --- START OF FILE Closedrecords.jsx ---

import React, { useEffect, useState } from 'react';
import { allbooks, allrecords, alluser } from '../../Services/Apis';

export default function Closedrecords() {
  // Initialize states with empty arrays
  const [records, setRecords] = useState([]);
  const [userDet, setUserDet] = useState([]);
  const [book, setBook] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true); // <-- Loading state
  

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // <-- Set loading true
      try {
        const resUser = await alluser();
        const resBook = await allbooks();
        const resRecords = await allrecords();
  
        console.log("Fetched Users:", resUser);
        console.log("Fetched Books:", resBook);
        console.log("Fetched Records:", resRecords);
  
        setUserDet(resUser || []); // Assuming Apis.js returns data directly now
        setBook(resBook || []);
        setRecords(resRecords || []);
  
      } catch (error) { /* ... */ }
      finally {
        setIsLoading(false); // <-- Set loading false AFTER all fetches
      }
    };
    fetchData();
  }, []);
  

  // Helper functions - ensure they handle missing data gracefully
  const getUserNameById = (user_id) => {
    // Find user by the custom string 'id' field
    const user = userDet.find((user) => user.id === user_id);
    return user ? user.name : 'Unknown User'; // Return placeholder if not found
  };

  const getBookNameById = (book_id) => {
    // Find book by the custom string 'id' field
    const bookName = book.find((b) => b.id === book_id);
    return bookName ? bookName.b_name : 'Unknown Book'; // Return placeholder
  };

  const getBookAuthorById = (book_id) => {
    const bookName = book.find((b) => b.id === book_id);
    return bookName ? bookName.author : 'Unknown Author'; // Return placeholder
  };

  // Filter records based on search query
  // Add optional chaining to prevent errors if fields are missing/null
  const filteredRecords = records.filter((record) =>
    record.status === "1" && ( // Only include closed records (status "1")
        getUserNameById(record.user_id)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getBookNameById(record.book_id)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getBookAuthorById(record.book_id)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.issued_on?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.due_date?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.returned_on?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.fine?.toString().toLowerCase().includes(searchQuery.toLowerCase()) // Ensure fine is string for includes
    )
  );
  console.log("Current State - Users:", userDet);
  console.log("Current State - Books:", book);
  console.log("Current State - Records:", records);

  return (
    <div className='user-container'>
      <div className="dashboard-header">
        <h1>Closed Records</h1>
      </div>
      <div className="search">
        <div className="search-container">
            {/* Search input JSX */}
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
        <thead>
           <tr>
              <th>SL</th>
              <th>Name</th>
              <th>Book Name</th>
              <th>Author</th>
              <th>Issued On</th>
              <th>Due Date</th>
              <th>Returned On</th>
              <th>Fine</th>
           </tr>
        </thead>
        <tbody>
            {filteredRecords && filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                  // The outer filter already ensures record.status === "1"
                  <tr key={record.id}> {/* Use record MongoDB _id or unique key */}
                      <td>{index + 1}</td>
                      <td>{getUserNameById(record.user_id)}</td>
                      <td>{getBookNameById(record.book_id)}</td>
                      <td>{getBookAuthorById(record.book_id) || 'N/A'}</td>
                      <td>{record.issued_on || 'N/A'}</td>
                      <td>{record.due_date || 'N/A'}</td>
                      <td>{record.returned_on || 'N/A'}</td>
                      <td>{record.fine || 0}</td> {/* Default fine to 0 */}
                  </tr>
                )
              )
            ) : (
               <tr>
                  <td colSpan="8"> {/* Adjusted colSpan */}
                     {records.filter(r=>r.status === "1").length === 0 ? "No closed records found." : "Loading or applying filter..."}
                  </td>
               </tr>
            )}
        </tbody>
      </table>
    </div>
  );
}
// --- END OF FILE Closedrecords.jsx ---              