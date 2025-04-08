import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Removed unused Link
import { signin } from '../../Services/Apis'; // Adjust path if needed

// Accept onLogin prop
export default function Signin({ onLogin }) {
    const navigate = useNavigate();
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const [user, setUser] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

    const validateForm = () => {
        let formErrors = {};
        if (!user.email) {
            formErrors.email = "Email is Required";
        } else if (!emailRegex.test(user.email)) {
            formErrors.email = "Enter valid email format";
        }
        if (!user.password) {
            formErrors.password = "Password is Required";
        }
        return formErrors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
        if(apiError) {
            setApiError(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setApiError(null);

        const formErrors = validateForm();
        setErrors(formErrors);

        if (Object.keys(formErrors).length === 0) {
            setIsLoading(true);
            const credentials = {
                email: user.email,
                password: user.password
            };
            console.log("Attempting to sign in with:", credentials);

            try {
                const response = await signin(credentials);
                console.log("Signin successful:", response);

                // --- CRITICAL FIXES ---
                // 1. Use the consistent localStorage key
                localStorage.setItem("isLoggedIn", "true");

                // 2. Call the onLogin function passed from App.js
                // This updates the state in the parent component
                if (typeof onLogin === 'function') {
                    onLogin();
                    console.log("Signin.js: onLogin prop called");
                } else {
                    console.error("Signin.js: onLogin prop is not a function!");
                }
                // --- END CRITICAL FIXES ---

                setIsLoading(false);

                // Navigate AFTER updating state (though React might batch updates)
                // Navigating to '/' allows App.js's root route to decide
                // whether to show Dashboard (now that isLoggedIn should be true) or Signin.
                navigate('/');
                console.log("Signin.js: Navigating to /");

                // Avoid window.location.reload() unless absolutely necessary

            } catch (error) {
                setIsLoading(false);
                console.error("Signin failed:", error);
                if (error.response && error.response.data && error.response.data.error) {
                    setApiError(error.response.data.error);
                } else if (error.message) {
                     setApiError(`Login failed: ${error.message}`);
                } else {
                    setApiError("Login failed. Please check credentials or network.");
                }
            }
        } else {
            console.log("Frontend validation failed", formErrors);
        }
    };

    return (
        <>
            <div className="form-container">
                <p className="title">Login</p>
                <form className="form" onSubmit={handleSubmit}>
                    {/* Input fields remain the same */}
                    <div className="input-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            placeholder='Email'
                            value={user.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            />
                        {errors.email && <span style={{ color: "red", fontSize: "0.8em" }}>{errors.email}</span>}
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder='Password'
                            value={user.password}
                            onChange={handleInputChange}
                            disabled={isLoading}
                             />
                        {errors.password && <span style={{ color: "red", fontSize: "0.8em" }}>{errors.password}</span>}
                        <div className="forgot">
                            <a rel="noopener noreferrer" href="#">Forgot Password ?</a>
                        </div>
                    </div>

                     {apiError && <div style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>{apiError}</div>}

                    <button type="submit" className="sign" disabled={isLoading}>
                         {isLoading ? "Signing In..." : "Sign in"}
                    </button>
                </form>
                 {/* Social login and Sign up link remain the same */}
                 <div className="social-message">
                     {/* ... */}
                 </div>
                 <div className="social-icons">
                     {/* ... */}
                 </div>
                 <p className="signup">
                    {/* ... */}
                 </p>
            </div>
        </>
    )
}