import axios from "axios";

// Use the correct base URL for your running Django server
import { Capacitor } from '@capacitor/core';

let dynamicBaseUrl;
const platform = Capacitor.getPlatform();

if (platform === 'web') {
  dynamicBaseUrl = process.env.REACT_APP_API_BASE_URL_WEB || 'http://127.0.0.1:8000';
} else if (platform === 'android' || platform === 'ios') {
  // IMPORTANT: Use YOUR computer's IP during development
  // In production, this should point to your deployed backend URL
  dynamicBaseUrl = process.env.REACT_APP_API_BASE_URL_MOBILE_DEV || 'http://192.168.1.105:8000'; // Your dev IP
} else {
  dynamicBaseUrl = 'http://127.0.0.1:8000'; // Default fallback
}

// Define separate env vars in your .env files if needed:
// REACT_APP_API_BASE_URL_WEB=http://127.0.0.1:8000
// REACT_APP_API_BASE_URL_MOBILE_DEV=http://192.168.1.105:8000
// REACT_APP_API_BASE_URL=https://your-prod-api.com (Used by production builds)

const BASE_URL = (process.env.NODE_ENV === 'production')
                 ? process.env.REACT_APP_API_BASE_URL // Production build always uses this
                 : dynamicBaseUrl; 
// Use the dynamic URL for development
// const BASE_URL = "http://192.168.1.105:8000"; // Example IP

// Ensure ALL URLs used for List views (POST) or Detail views (PUT/DELETE) have a TRAILING SLASH
const Admin_Login_url = `${BASE_URL}/api/admin/login/`;
const User_url = `${BASE_URL}/api/users/`;      // <-- OK (Has Slash)
const Book_url = `${BASE_URL}/api/books/`;      // <-- OK (Has Slash)
const Records_url = `${BASE_URL}/api/records/`;  // <-- OK (Has Slash)

// === Admin ===
export const signin = async (credentials) => {
    try {
        console.log("Sending credentials to backend:", credentials);
        const response = await axios.post(Admin_Login_url, credentials); // URL ends in /
        console.log("Signin API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error in signin API call:", error.response ? error.response.data : error.message);
        throw error;
    }
};

// === User ===
export const newuser = async (data) => {
    try {
        // No ID needed for creating new user, API should handle generating it or expecting it in data
        const response = await axios.post(User_url, data); // URL ends in /
        console.log("New User API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error in newuser API call:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const alluser = async () => {
    try {
        const response = await axios.get(User_url); // GET can handle no slash sometimes due to APPEND_SLASH GET redirect
        console.log("All Users API Response:", response.data);
        return response.data; // Should now return the array
    } catch (error) {
        console.error("Error in alluser API call:", error.response ? error.response.data : error.message);
        // Return empty array on error to prevent UI crashes
        return [];
    }
};

export const getSingleUser = async (id) => {
    try {
        // Use the custom string ID, ensure URL has trailing slash
        const response = await axios.get(`${User_url}${id}/`); // <-- ADDED Trailing Slash
        console.log("Single User API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error(`Error in getSingleUser API call (ID: ${id}):`, error.response ? error.response.data : error.message);
        throw error;
    }
};


export const edituser = async (id, data) => {
    // IMPORTANT: Check what 'id' is passed from Addmodal's handelEdit
    // It seems you were passing the whole user object first, then the id
    // Assuming 'id' here is the string ID for the URL, and 'data' is the payload
    try {
        // Use the custom string ID, ensure URL has trailing slash
        const response = await axios.put(`${User_url}${id}/`, data); // <-- ADDED Trailing Slash
        console.log("Edit User API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error(`Error in edituser API call (ID: ${id}):`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const deleteUser = async (id) => {
    try {
        // Use the custom string ID, ensure URL has trailing slash
        const response = await axios.delete(`${User_url}${id}/`); // <-- ADDED Trailing Slash
        console.log("Delete User API Response:", response.status);
        return response.status;
    } catch (error) {
        console.error(`Error in deleteUser API call (ID: ${id}):`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// === Book ===
export const newbooks = async (data) => {
    try {
        // API expects custom 'id' in data for book creation based on model
        const response = await axios.post(Book_url, data); // URL ends in /
        console.log("New Book API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error in newbooks API call:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const allbooks = async () => {
    try {
        const response = await axios.get(Book_url);
        console.log("All Books API Response:", response.data);
        return response.data; // Should return array
    } catch (error) {
        console.error("Error in allbooks API call:", error.response ? error.response.data : error.message);
        return []; // Return empty array on error
    }
};

export const getSingleBook = async (id) => {
    try {
         // Use the custom string ID, ensure URL has trailing slash
        const response = await axios.get(`${Book_url}${id}/`); // <-- ADDED Trailing Slash
        console.log("Single Book API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error(`Error in getSingleBook API call (ID: ${id}):`, error.response ? error.response.data : error.message);
        throw error;
    }
};


export const editbooks = async (id, data) => {
    try {
        // Use the custom string ID, ensure URL has trailing slash
        const response = await axios.put(`${Book_url}${id}/`, data); // <-- ADDED Trailing Slash
        console.log("Edit Book API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error(`Error in editbooks API call (ID: ${id}):`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const deletebook = async (id) => {
    try {
        // Use the custom string ID, ensure URL has trailing slash
        const response = await axios.delete(`${Book_url}${id}/`); // <-- ADDED Trailing Slash
        console.log("Delete Book API Response:", response.status);
        return response.status;
    } catch (error) {
        console.error(`Error in deletebook API call (ID: ${id}):`, error.response ? error.response.data : error.message);
        throw error;
    }
};

// === Record ===
export const newrecord = async (data) => {
    try {
        const response = await axios.post(Records_url, data); // URL ends in /
        console.log("New Record API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error in newrecord API call:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const allrecords = async () => {
    try {
        const response = await axios.get(Records_url);
        console.log("All Records API Response:", response.data);
        return response.data; // Should return array
    } catch (error) {
        console.error("Error in allrecords API call:", error.response ? error.response.data : error.message);
        return []; // Return empty array on error
    }
};

export const getSingleRecord = async (id) => {
     // Record ID is the ObjectId string
    try {
        const response = await axios.get(`${Records_url}${id}/`); // <-- ADDED Trailing Slash
        console.log("Single Record API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error(`Error in getSingleRecord API call (ID: ${id}):`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const editrecord = async (id, data) => {
    // Record ID is the ObjectId string
    try {
        const response = await axios.put(`${Records_url}${id}/`, data); // <-- ADDED Trailing Slash
        console.log("Edit Record API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error(`Error in editrecord API call (ID: ${id}):`, error.response ? error.response.data : error.message);
        throw error;
    }
};

export const deleteRecord = async (id) => {
     // Record ID is the ObjectId string
    try {
        const response = await axios.delete(`${Records_url}${id}/`); // <-- ADDED Trailing Slash
        console.log("Delete Record API Response:", response.status);
        return response.status;
    } catch (error) {
        console.error(`Error in deleteRecord API call (ID: ${id}):`, error.response ? error.response.data : error.message);
        throw error;
    }
};