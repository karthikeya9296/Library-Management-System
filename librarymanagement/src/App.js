import './App.css';
import React, { useEffect, useState, useCallback } from 'react'; // Import useCallback
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from './components/Sidebar/Sidebar';
import Signin from './components/Admin/Signin';
import Dashboard from './components/Dashboard';
import Userdetasils from './components/Users/Userdetasils';
import Bookdetails from './components/Books/Bookdetails';
import Closedrecords from './components/Records/Closedrecords';
import Openrecords from './components/Records/Openrecords';
import Addmodal from './components/Addmodal';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Optional but Recommended: Protected Route Component ---
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    // Redirect them to the / path, which will show Signin
    return <Navigate to="/" replace />;
  }
  return children;
};
// --- End Protected Route Component ---

function App() {
  // Initialize state based on localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("isLoggedIn"));

  // Check local storage only once on initial mount for robustness
  useEffect(() => {
    const checkLoginStatus = () => {
      const signedIn = !!localStorage.getItem("isLoggedIn");
      if (signedIn !== isLoggedIn) { // Only update if status changed externally (e.g., manual clear)
         setIsLoggedIn(signedIn);
      }
    };
    checkLoginStatus();

    // Optional: Listen for storage changes in other tabs/windows
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [isLoggedIn]); // Re-run if isLoggedIn state changes internally

  // Use useCallback to prevent unnecessary re-renders of Signin
  const handleLogin = useCallback(() => {
    // Assume login was successful, set localStorage (though Signin does this too)
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
    console.log("App.js: handleLogin called, isLoggedIn set to true");
  }, []); // No dependencies needed if it only sets state

  const handleLogout = useCallback(() => {
    // Clear authentication state
    localStorage.removeItem("isLoggedIn");
    // Reset user data state
    setIsLoggedIn(false);
    // Optional: Redirect to login page after logout
    // navigate('/'); // This would require useNavigate hook in App
    console.log("App.js: handleLogout called, isLoggedIn set to false");
  }, []);

  return (
    <div className="App">

      <ToastContainer />
      <Router>
        {/* Conditionally render Sidebar based on login state */}
        {isLoggedIn && <div className="sidebar col"><Sidebar onLogout={handleLogout} /></div>} {/* Pass logout handler to Sidebar */}

        <div className={`content ${isLoggedIn ? 'content-shifted' : ''}`}> {/* Optional: Add class to shift content */}
          <Routes>
            {/* Route for Login or Dashboard */}
            <Route
              path="/"
              element={
                isLoggedIn ? <Dashboard /> : <Signin onLogin={handleLogin} />
              }
            />

            {/* Protected Routes */}
            <Route
              path="/user"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Userdetasils />
                </ProtectedRoute>
              }
            />
            <Route
              path="/books"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Bookdetails />
                </ProtectedRoute>
              }
            />
             <Route
              path="/closedrecords"
               element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Closedrecords />
                 </ProtectedRoute>
              }
            />
             <Route
              path="/openrecords"
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <Openrecords />
                 </ProtectedRoute>
               }
             />
            {/* Test route - decide if it needs protection */}
            <Route path="/test" element={<Addmodal />} />

            {/* Optional: Catch-all route for 404 or redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </div>
        {/* Removed the Navigate component from here */}
      </Router>
    </div>
  );
}

export default App;

// Add basic CSS for content shifting (in App.css or similar)
/*
.App {
  display: flex;
}

.sidebar {
  width: 250px; // Example width
  flex-shrink: 0;
  // Add other sidebar styles
}

.content {
  flex-grow: 1;
  padding: 20px;
  transition: margin-left 0.3s ease; // Smooth transition
}

.content-shifted {
   // No shift needed if sidebar is always present visually
   // or adjust margin if sidebar overlays
   // margin-left: 250px; // Adjust if sidebar pushes content
}
*/