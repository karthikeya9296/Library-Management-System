// --- START OF FILE Dashboard.jsx ---

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar'; // Assuming Sidebar path is correct
import { allbooks, allrecords, alluser } from '../Services/Apis';
import ChartData from './Chart/ChartData'; // Assuming ChartData path is correct

export default function Dashboard() {
  const [userCount, setUserCount] = useState(0);
  const [bookCount, setBookCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const userData = await alluser(); // Expecting array or undefined/null
        const bookData = await allbooks(); // Expecting array or undefined/null
        const recordData = await allrecords(); // Expecting array or undefined/null

        // Use optional chaining and default value 0
        setUserCount(userData?.length || 0);
        setBookCount(bookData?.length || 0);

        // Default recordData to an empty array before filtering
        const openRecords = (recordData || []).filter(record => record.status === "0");
        setRecordCount(openRecords.length);

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Optionally set counts to 0 or display an error state
        setUserCount(0);
        setBookCount(0);
        setRecordCount(0);
    }
  };

  return (
    <>
      <div className="col-md-2 " style={{ width: "100%" }}>
        <div className="dashbody row">
          <div className="container col">

            <div className="card1">
              <div className="content">
                {userCount}
              </div>
              {/* Consider using Link component for navigation */}
              <span><div className="foot"><Link to="/user">View users</Link></div></span>
            </div>

            <div className="card2">
              <div className="content">
                {bookCount}
              </div>
               {/* Consider using Link component for navigation */}
              <div className="foot"><Link to="/books">View Books</Link></div>
            </div>

            <div className="card3">
              <div className="content">
                {recordCount}
              </div>
              {/* Consider using Link component for navigation */}
              <div className="foot"><Link to="/openrecords">View Open Records</Link></div>
            </div>
          </div>
        </div>
        <ChartData />
      </div>
    </>
  );
}
// --- END OF FILE Dashboard.jsx ---