import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom'; // Keep Link if used for trigger
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { allbooks, allrecords, alluser, editbooks, edituser, newbooks, newrecord, newuser } from '../Services/Apis'; // Assuming editbooks might be used
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Make sure toast CSS is imported somewhere

// Ensure CSS for your form ('form-container', 'input-group', etc.) is loaded
// import './your-modal-styles.css'; // Example path

export default function Addmodal(props) {
    // --- State ---
    const [users, setUsers] = useState([]);
    const [newBook, setNewBook] = useState([]);
    const [records, setRecords] = useState([]);
    // User/Book text input state
    const [field1, setField1] = useState('');
    const [field2, setField2] = useState('');
    const [field3, setField3] = useState('');
    const [field4, setField4] = useState('');
    const [fieldId, setFieldId] = useState(''); // For custom User/Book ID input
    // Record dropdown state
    const [uId, setUId] = useState('');
    const [bId, setBId] = useState('');
    // Modal visibility
    const [open, setOpen] = useState(false);
    const modalRef = useRef();
    // Derived state for easier logic
    const isEditOrView = props.datares === true;
    const isViewOnly = isEditOrView && props.btnres === true;
    const isAdd = !isEditOrView; // Assumes datares=false means Add (for user/book)

    // --- Data Fetching ---
    // Simplified data fetching functions
    const getBooks = async () => { try { const res = await allbooks(); setNewBook(res || []); } catch (e) { console.error("Fetch Books Error:", e); setNewBook([]); } };
    const getUsers = async () => { try { const res = await alluser(); setUsers(res || []); } catch (e) { console.error("Fetch Users Error:", e); setUsers([]); } };
    const getRecords = async () => { try { const res = await allrecords(); setRecords(res || []); } catch (e) { console.error("Fetch Records Error:", e); setRecords([]); } };

    // Effect to manage data fetching and state reset when modal opens/props change
    useEffect(() => {
        // Populate Edit/View fields only when it's an edit/view action
        if (isEditOrView && props.role !== 'new record' ) { // Ensure it's not the record modal trigger
             // props.id is the custom string id passed for edit/view user/book
            setField1(props.data1 || '');
            setField2(props.data2 || '');
            setField3(props.data3 || '');
            setField4(props.data4 || '');
            setFieldId(''); // ID input not shown/needed for edit/view
        } else if (!open) {
             // If modal is closed, potentially reset (or handled when opening)
        }

        // Fetch data needed based on the CURRENT action type when modal opens
        if (open) {
             console.log("Modal opened, fetching data for:", props.submitres, props.role);
             // Reset fields unless it's edit/view (handled above)
             if (!isEditOrView) {
                 setField1(''); setField2(''); setField3(''); setField4(''); setFieldId('');
                 setUId(''); setBId('');
             }

             if (props.submitres === "3" || props.role === 'new record') { // ISSUE RECORD needs users & books
                getUsers();
                getBooks();
                getRecords(); // For validation check
             } else if (props.submitres === "1" || props.role === 'editUser') { // ADD/EDIT USER needs user list for validation
                 getUsers();
             } else if (props.submitres === "2" || props.role === 'editBook') { // ADD/EDIT BOOK needs book list for validation
                 getBooks();
             }
         }
    }, [
         open, isEditOrView, props.role, props.submitres,
         props.data1, props.data2, props.data3, props.data4, props.id // Add props.id
     ]);


    // --- Modal Visibility & Closing ---
    const onTrigger = () => { setOpen(prev => !prev); }

    useEffect(()=>{
       const closeModal=(e)=>{ if(modalRef.current && !modalRef.current.contains(e.target)){ setOpen(false) } }
       if (open) { document.addEventListener("mousedown", closeModal); }
       else { document.removeEventListener("mousedown", closeModal); }
       return(()=> document.removeEventListener("mousedown", closeModal));
    }, [open]);


    // --- Calculations (example) ---
    const calculateDueDate = () => { return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];};


    // --- Submit Handlers ---
    const handleAddOrIssueSubmit = async (e) => {
        e.preventDefault();

        // ADD USER
        if (props.submitres === "1") {
             if (!fieldId) { toast.error("User ID is required."); return; }
             const isUserAlreadyAdded = Array.isArray(users) && users.some(user => user.id === fieldId || user.email === field2 || user.mobile === field3);
             if (isUserAlreadyAdded) { toast.error("User with this ID/Email/Mobile already exists."); return; }
             const payload = { id: fieldId, name: field1, email: field2, mobile: field3, address: field4 };
             try { await newuser(payload); toast.success("User added!"); getUsers(); setOpen(false); } catch (error) { toast.error(`Add User Failed: ${error.response?.data?.error || error.message}`); }
        }
        // ADD BOOK
        else if (props.submitres === "2") {
             if (!fieldId) { toast.error("Book ID is required."); return; }
             const isBookAlreadyAdded = Array.isArray(newBook) && newBook.some(book => book.id === fieldId || book.b_name === field1);
             if (isBookAlreadyAdded) { toast.error("Book with this ID/Name already exists."); return;}
             const payload = { id: fieldId, b_name: field1, author: field2, genre: field3, stock: field4 };
             try { await newbooks(payload); toast.success("Book added!"); getBooks(); setOpen(false); } catch (error) { toast.error(`Add Book Failed: ${error.response?.data?.error || error.message}`); }
        }
        // ISSUE RECORD
        else if (props.submitres === "3") {
             if(!uId || !bId){ toast.error("Please select both User and Book."); return; }
             const isBookAlreadyIssued = Array.isArray(records) && records.some(record => record.user_id === uId && record.book_id === bId && record.status === "0");
             if (isBookAlreadyIssued) { toast.error("This book is already issued to this user."); return; }
             const payload = {
                 user_id: uId, book_id: bId, status: "0",
                 issued_on: new Date().toISOString().split('T')[0],
                 due_date: calculateDueDate()
                 // Omit fine/returned_on, backend should handle defaults
             };
             try { await newrecord(payload); toast.success("Book issued!"); getRecords(); setOpen(false); } catch (error) { toast.error(`Issue Book Failed: ${error.response?.data?.error || error.message}`); }
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const itemId = props.id; // Get the ID of the item being edited
        if (!itemId) { toast.error("Item ID is missing for update."); return; }

        // EDIT USER
        if (props.role === "editUser") {
            const payload = { name: field1, email: field2, mobile: field3, address: field4 };
            try { await edituser(itemId, payload); toast.success("User updated!"); getUsers(); setOpen(false); } catch (error) { toast.error(`Update User Failed: ${error.response?.data?.error || error.message}`); }
        }
        // EDIT BOOK
        else if (props.role === "editBook") {
             const payload = { b_name: field1, author: field2, genre: field3, stock: field4 };
            try { await editbooks(itemId, payload); toast.success("Book updated!"); getBooks(); setOpen(false); } catch (error) { toast.error(`Update Book Failed: ${error.response?.data?.error || error.message}`); }
        }
    };


    // --- Conditional Form Rendering ---
    const renderFormContent = () => {

        // --- ISSUE RECORD FORM ---
        // Trigger based on submitres prop from parent (Openrecords)
        if (props.submitres === "3") {
            return (
                 <form className="form" onSubmit={handleAddOrIssueSubmit}>
                     {/* User Dropdown */}
                     <div className="input-group"> {/* Changed class for consistency */}
                        <label htmlFor="issueUserSelect">Select User*</label>
                        <select id="issueUserSelect" value={uId} onChange={(e) => setUId(e.target.value)} required>
                            <option value="" disabled>-- Select --</option>
                            {users.map((user) => (<option key={user.id} value={user.id}>{user.name} ({user.id})</option>))}
                        </select>
                     </div>
                     {/* Book Dropdown */}
                     <div className="input-group">
                         <label htmlFor="issueBookSelect">Select Book*</label>
                        <select id="issueBookSelect" value={bId} onChange={(e) => setBId(e.target.value)} required>
                             <option value="" disabled>-- Select --</option>
                            {newBook.map((book) => (<option key={book.id} value={book.id}>{book.b_name} ({book.id})</option>))}
                         </select>
                     </div>
                     {/* Display Dates */}
                     <div className="input-group"> <label >Issue Date:</label> <input type="text" value={new Date().toLocaleDateString()} disabled /> </div>
                     <div className="input-group"> <label >Due Date:</label> <input type="text" value={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} disabled /> </div>

                     <button type='submit' className="sign">Issue Book</button>
                 </form>
             );
        }

        // --- USER / BOOK forms (ADD/EDIT/VIEW) ---
        // Trigger based on formresponse=true from parent (Userdetails/Bookdetails)
        else if (props.formresponse === true) {
            const isBook = props.submitres === "2" || props.role === 'editBook' || props.role === 'viewBook'; // Determine if it's book-related
            const currentSubmitHandler = isEditOrView ? handleEditSubmit : handleAddOrIssueSubmit;

            return (
                 <form className="form" onSubmit={currentSubmitHandler}>
                      {/* Custom ID input only needed for Add User/Book */}
                     {isAdd && (props.submitres === "1" || props.submitres === "2") && (
                         <div className="input-group">
                             <label htmlFor="customId">{isBook ? "Book ID*" : "User ID*"}</label>
                             <input type="text" id="customId" className="input" value={fieldId} onChange={(e) => setFieldId(e.target.value)} required disabled={isViewOnly}/>
                         </div>
                     )}

                     {/* --- Dynamic Fields based on props --- */}
                     <div className="input-group">
                         <label htmlFor="field1">{props.field1 || "Field 1"}*</label>
                         <input id="field1" type="text" className="input" value={field1} onChange={(e)=> setField1(e.target.value)} disabled={isViewOnly} required/>
                     </div>
                     <div className="input-group">
                         <label htmlFor="field2">{props.field2 || "Field 2"}{!isBook && '*'}</label> {/* Required for User Email */}
                         <input id="field2" type={!isBook ? 'email':'text'} className="input" value={field2} onChange={(e)=> setField2(e.target.value)} disabled={isViewOnly} required={!isBook}/>
                     </div>
                     <div className="input-group">
                         <label htmlFor="field3">{props.field3 || "Field 3"}{!isBook && '*'}</label> {/* Required for User Mobile */}
                         <input id="field3" type={!isBook ? 'tel':'text'} className="input" value={field3} onChange={(e)=> setField3(e.target.value)} disabled={isViewOnly} required={!isBook}/>
                     </div>
                     <div className="input-group">
                         <label htmlFor="field4">{props.field4 || "Field 4"}{isBook && '*'}</label> {/* Required for Book Stock */}
                         <input id="field4" type={isBook ? 'number':'text'} className="input" value={field4} onChange={(e)=> setField4(e.target.value)} disabled={isViewOnly} required={isBook} min={isBook ? "0" : undefined}/>
                     </div>

                    {/* Submit/Update Button only if not View mode */}
                    {!isViewOnly && <button type="submit" className="sign">{isAdd ? "Add" : "Update"}</button>}
                 </form>
             );
        }
        // Fallback if props don't match expected patterns
        else {
             console.error("Modal render condition mismatch!", props);
             return <p>Modal failed to render due to incorrect props.</p>;
        }
    };

    // --- Component Return ---
    return (
     <>
       {/* Trigger element rendering based on props.res/btnres */}
       <div>
         {props.res ? (
             <div className='btnres'>
                 {props.btnres ?
                   (<Link className='btn3' onClick={onTrigger} title={`View ${props.role?.includes('Book') ? 'Book' : 'User'}`}><VisibilityIcon/></Link>) :
                   (<Link className='btn1' onClick={onTrigger} title={`Edit ${props.role?.includes('Book') ? 'Book' : 'User'}`}><EditIcon/></Link>)
                 }
             </div>
           ) : (
             <div><button onClick={onTrigger}>{props.title || 'Open'}</button></div>
           )
         }
       </div>

       {/* Modal rendering */}
       {open && (
         <>
           {/* Overlay */}
           <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} onClick={() => setOpen(false)}></div>
           {/* Modal Box */}
           <div ref={modalRef} className="form-container" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'white', padding: '20px', border: '1px solid #ccc', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', minWidth: '350px', maxWidth: '90vw', maxHeight:'80vh', overflowY: 'auto' }}>
               <p className="title">{props.headertitle || 'Modal'}</p>
               {renderFormContent()}
               <button type="button" onClick={() => setOpen(false)} style={{ marginTop: '15px', cursor: 'pointer', padding: '8px 15px' }}>Close</button>
           </div>
         </>
       )}
     </>
   );
}
// --- END OF FILE Addmodal.jsx ---