// --- START OF FILE Bookdetails.jsx ---

import React, { useEffect, useState } from 'react';
import { allbooks, allrecords, deletebook } from '../../Services/Apis';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';
import Addmodal from '../Addmodal';

const MemoizedAddModal = React.memo(Addmodal);

export default function Bookdetails(props) {
  const [newBook, setNewBook] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [issuedBooksCount, setIssuedBooksCount] = useState({});
  const [isLoading, setIsLoading] = useState(true); // <-- Add loading state

  const getbooks = async () => {
    setIsLoading(true); // <-- Set loading true before fetch
    try {
        const res = await allbooks();
        console.log("API Response Data (Books):", res); // Log the response (already returning .data)
        const bookData = res || []; // Directly use res if Apis.js returns .data
        setNewBook(bookData);
        console.log("Book state set with:", bookData); // Log data passed to state
    } catch (error) {
        console.error("Error fetching books:", error);
        setNewBook([]);
    } finally {
        // Removed setIsLoading(false) here, let getIssuedBooksCount handle it
    }
  };

  const getIssuedBooksCount = async () => {
     // Don't set isLoading here, let getbooks control the primary loading
    try {
        const res = await allrecords();
        console.log("API Response Data (Records for count):", res); // Log record response
        const records = res || []; // Directly use res if Apis.js returns .data
        const issuedCount = {};
        records.forEach((record) => {
          if (record.status === '0' && record.book_id) {
            issuedCount[record.book_id] = (issuedCount[record.book_id] || 0) + 1;
          }
        });
        setIssuedBooksCount(issuedCount);
        console.log("Issued counts set:", issuedCount); // Log counts
    } catch (error) {
        console.error("Error fetching records for issued count:", error);
        setIssuedBooksCount({});
    } finally {
       setIsLoading(false); // <-- Set loading false after BOTH fetches attempt
    }
  };

  const deleteData = async (id) => {
    // Consider adding confirmation dialog before deleting
    try {
        await deletebook(id);
        // Re-trigger fetch sequence
        getbooks().then(getIssuedBooksCount); // Chain fetches
    } catch (error) {
        console.error(`Error deleting book ${id}:`, error);
        // Show error toast/message
    }
  };

  useEffect(() => {
     // Fetch sequence on mount
     getbooks().then(getIssuedBooksCount);
  }, []);


  const filteredBooks = newBook.filter((book) =>
    book?.b_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book?.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book?.genre?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateAvailableStock = (book) => {
    // Use optional chaining for safety
    const bookId = book?.id;
    const issuedCount = bookId ? issuedBooksCount[bookId] || 0 : 0;
    const stock = book?.stock || 0;
    const availableStock = stock - issuedCount;
    return Math.max(0, availableStock);
  };

  // Log state just before render
  console.log("Rendering Bookdetails - State:", { newBook, isLoading });

  return (
    <>
      <div className='user-container'>
        {/* Header and Search... */}
        <div className="dashboard-header">
          <h1>Book List</h1>
          <MemoizedAddModal submitres="2" formresponse={true} title='Add Book' headertitle=" Add book details" field1="Book Name" field2="Author" field3="Genre" field4="Total Stock" />
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
                {/* ... table headers ... */}
                <th>SL</th><th>Book Name</th><th>Author</th><th>Genre</th><th>Stock</th><th>Available</th><th>Actions</th>
           </thead>
           <tbody>
            {isLoading ? ( // <-- Show loading state
                <tr><td colSpan="7">Loading books...</td></tr>
            ) : filteredBooks && filteredBooks.length > 0 ? ( // <-- Render only if not loading and books exist
              filteredBooks.map((book, index) => {
                 // ---> Add Log Here <---
                 console.log(`Mapping book at index ${index}:`, JSON.stringify(book));
                 // ---> Add Log Here <---
                 // Double-check all properties exist on 'book' before accessing
                 const bookId = book?.id ?? `no-id-${index}`; // Use actual ID or fallback
                 const bookName = book?.b_name ?? 'No Name';
                 const author = book?.author ?? 'N/A';
                 const genre = book?.genre ?? 'N/A';
                 const stock = book?.stock ?? 0;

                 return (
                      <tr key={bookId}>
                         <td>{index + 1}</td>
                         <td>{bookName}</td>
                         <td>{author}</td>
                         <td>{genre}</td>
                         <td>{stock}</td>
                         <td>{calculateAvailableStock(book)}</td>
                         <td className='action'>
                            <MemoizedAddModal datares={true} res={true} formresponse={true} btnres={false}
                            title="Edit Book" role="editBook" headertitle=" Edit book details" id={bookId}
                            field1="Book Name" field2="Author" field3="Genre" field4="Stock"
                            data1={bookName} data2={author} data3={genre} data4={stock}/>
                            <button className='btn2'
                            style={{ marginRight: "5%", paddingRight: "20px", paddingLeft: "20px", marginLeft: "5px" }}
                            onClick={() => deleteData(bookId)}
                            title="Delete Book"
                            disabled={bookId.startsWith('no-id-')} // Disable delete if ID missing
                            >
                            <DeleteIcon />
                            </button>
                         </td>
                      </tr>
                 );
              })
            ) : (
               <tr>
                    <td colSpan="7">No books found{searchQuery && ' matching your search'}.</td>
               </tr>
            )}
           </tbody>
        </table>
      </div>
    </>
  );
}
// --- END OF FILE Bookdetails.jsx ---