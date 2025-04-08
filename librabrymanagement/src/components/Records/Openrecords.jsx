// --- START OF FILE Openrecords.jsx ---

import React, { useEffect, useState } from 'react';
import { allbooks, allrecords, alluser, editrecord } from '../../Services/Apis'; // Removed unused newbooks
import Addmodal from '../Addmodal';
import 'react-datepicker/dist/react-datepicker.css'; // Ensure this CSS is needed/used
import { toast } from 'react-toastify';
// import { Link } from 'react-router-dom'; // Removed unused Link

const MemoizedAddModal = React.memo(Addmodal);

export default function Openrecords() {
  // Initialize states with empty arrays or appropriate defaults
  const [records, setRecords] = useState([]);
  const [userDet, setUserDet] = useState([]);
  const [book, setBook] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // <-- Loading state

  const [returnDate, setReturnDate] = useState({}); // Object to store return dates per record id
  // const [dueDate,setDueDate]= useState('') // Not used directly, fetched from record
  // const [prevSL, setprevSL] = useState(1); // SL calculation seems complex, using index is simpler
  const [searchQuery, setSearchQuery] = useState('');
  // const [slCounter, setSLCounter] = useState(0); // Removed complex SL logic
  // const [currentPage, setCurrentPage] = useState(1); // Removed pagination logic for now
  // const [recordsPerPage] = useState(5); // Removed pagination logic for now


  // Fetch data on mount
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
  

  // --- Helper Functions ---
  const getUserNameById = (user_id) => {
    const user = userDet.find((user) => user.id === user_id); // Match custom string id
    return user ? user.name : 'Unknown User';
  };

  const getBookNameById = (book_id) => {
    const bookName = book.find((b) => b.id === book_id); // Match custom string id
    return bookName ? bookName.b_name : 'Unknown Book';
  };

  const getBookAuthorById = (book_id) => {
    const bookName = book.find((b) => b.id === book_id);
    return bookName ? bookName.author : 'Unknown Author';
  };


  // --- Date and Fine Calculation ---
   const calculateFine = (dueDateStr, returnDateStr) => {
      if (!returnDateStr || !dueDateStr) return 0;
      try {
          // Parse assuming dates are valid date strings (e.g., YYYY-MM-DD or ISO)
          const dueDateObj = new Date(dueDateStr);
          const returnDateObj = new Date(returnDateStr);

          // Check for invalid dates
          if (isNaN(dueDateObj.getTime()) || isNaN(returnDateObj.getTime())) {
              console.warn("Invalid date format encountered:", dueDateStr, returnDateStr);
              return 0;
          }

          const differenceMs = returnDateObj - dueDateObj;
          // Calculate difference in days, rounding up for any part of a day overdue
          const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
          // Fine calculation: 2 units per day *overdue*. No fine if returned on or before due date.
          return Math.max(0, differenceDays) * 2;
      } catch (e) {
           console.error("Error calculating fine:", e);
           return 0; // Return 0 if date parsing fails
      }
   };

   const isFineToBePaid = (dueDate, returnDate) => {
     const fine = calculateFine(dueDate, returnDate);
     return fine > 0;
   };

   // Format date string like YYYY-MM-DDTHH:MM:SS to DD/MM/YYYY
   const formatDateDisplay = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const dateObj = new Date(dateStr);
            if (isNaN(dateObj.getTime())) return 'Invalid Date';
            const day = String(dateObj.getDate()).padStart(2, '0');
            const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
            const year = dateObj.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
             console.error("Error formatting date:", e);
             return 'Invalid Date';
        }
   }


  // --- Event Handlers ---
  const handleReturnDateChange = (recordId, date) => {
    setReturnDate(prev => ({ ...prev, [recordId]: date }));
  };

  const handleReturnBook = async (recordId) => {
    const recordToUpdate = records.find((record) => record.id === recordId);
    if (!recordToUpdate) {
        toast.error("Record not found!");
        return;
    }

    const returnDateForRecord = returnDate[recordId];
    if (!returnDateForRecord) {
      toast.error("Please pick a return date");
      return;
    }

    const fine = calculateFine(recordToUpdate.due_date, returnDateForRecord);

    // Prepare data for API - send dates as strings if backend expects strings
    const updatePayload = {
        returned_on: returnDateForRecord, // Send as YYYY-MM-DD string from date input
        fine: fine.toString(),
        status: "1", // Set status to closed/returned
        // Do not send user_id or book_id unless they are changing
    };

    try {
        // Pass the ID in the URL, and payload in the body
        console.log("Updating record ID:", recordId, "with payload:", updatePayload);
        // Use editrecord(id, data) format from Apis.js
        await editrecord(recordId, updatePayload);
        toast.success("Book returned successfully!");
        // Refetch data to update the UI
        const updatedRecords = records.map(r =>
           r.id === recordId ? { ...r, ...updatePayload } : r
        );
        setRecords(updatedRecords);
        // Clear the return date for this specific record from state
        setReturnDate(prev => {
            const newState = { ...prev };
            delete newState[recordId];
            return newState;
        });
    } catch (error) {
         console.error("Error updating record:", error.response ? error.response.data : error.message);
         toast.error(`Failed to return book. ${error.response?.data?.error || ''}`);
    }
  };


  // --- Filtering for Display ---
   const filteredRecords = records.filter((record) =>

    
        record.status === "0" && ( // Only show open records
            getUserNameById(record.user_id)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getBookNameById(record.book_id)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getBookAuthorById(record.book_id)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.user_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            record.book_id?.toLowerCase().includes(searchQuery.toLowerCase())
            
            // Add more fields to search if needed
        ),
        console.log("Rendering Records - State:", { isLoading, records, userDet, book })
      
      ); // Log state



    // --- Removed pagination logic for simplicity ---
    // const indexOfLastRecord = currentPage * recordsPerPage;
    // const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
    // Filter directly for open records to paginate if needed later
    // const filteredRecordss = records.filter(record => record.status === "0");
    // const currentRecords = filteredRecordss.slice(indexOfFirstRecord, indexOfLastRecord);
    // const paginate = pageNumber => setCurrentPage(pageNumber);


  return (
    <>
      <div className='user-container'>
        <div className="dashboard-header">
          <h1>Open Records</h1>
          {/* Ensure props are correct based on Addmodal */}
          <MemoizedAddModal formresponse={true} submitres="3" role="new record" title='Borrow Book' headertitle=" Add borrow details"
           field1="User ID" field2="Book ID" field3="Issue Date (YYYY-MM-DD)" field4="Due Date (YYYY-MM-DD)" />
        </div>
        <div className="search">
          <div className="search-container">
             {/* Search input JSX */}
            <input checked="" className="checkbox" type="checkbox"/>
            <div className="mainbox">
                <div className="iconContainer">
                    <svg viewBox="0 0 512 512" height="1em" xmlns="http://www.w3.org/2000/svg" className="search_icon"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"></path></svg>
                </div>
                <input className="search_input" placeholder="Search by User ID or Book ID" type="text" value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
           {/* Pagination UI Removed */}
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
                <th>Return Date</th> {/* Changed from Returned On */}
                <th>Fine</th>
                <th>Actions</th>
             </tr>
          </thead>
          <tbody>
           {filteredRecords && filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => {
                 // record.status === "0" is guaranteed by the filter
                 const currentReturnDate = returnDate[record.id] || ''; // Get return date for this record
                 const currentFine = calculateFine(record.due_date, currentReturnDate);
                 const needsToPay = isFineToBePaid(record.due_date, currentReturnDate);

                return (
                  <tr key={record.id}> {/* Use record's actual unique ID */}
                    <td>{index + 1}</td> {/* Simple sequential SL based on filtered list */}
                    <td>{getUserNameById(record.user_id)}</td>
                    <td>{getBookNameById(record.book_id)}</td>
                    <td>{getBookAuthorById(record.book_id) || 'N/A'}</td>
                    <td>{formatDateDisplay(record.issued_on)}</td>
                    <td>{formatDateDisplay(record.due_date)}</td>
                    <td>
                      <input
                        type="date" // Standard HTML5 date picker
                        value={currentReturnDate}
                        onChange={(e) => handleReturnDateChange(record.id, e.target.value)}
                        required // Make picking a date required to enable button
                        max={new Date().toISOString().split('T')[0]} // Optionally restrict max date to today
                      />
                    </td>
                    <td>{currentFine}</td>
                    <td className='action'>
                       {/* Disable button if no return date is selected */}
                      <button onClick={() => handleReturnBook(record.id)} disabled={!currentReturnDate}>
                        {needsToPay ? 'Pay Fine & Return' : 'Return Book'}
                      </button>
                    </td>
                  </tr>
                )
              })
            ) : (
                <tr>
                    <td colSpan="9"> {/* Adjusted colSpan */}
                        {records.filter(r => r.status === "0").length === 0 ? "No open records found." : "Loading or applying filter..."}
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
// --- END OF FILE Openrecords.jsx ---