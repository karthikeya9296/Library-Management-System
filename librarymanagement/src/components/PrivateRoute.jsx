import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar/Sidebar';
import Userdetasils from './Users/Userdetasils';

const PrivateRoute = ({ isLoggedIn, component: Component, ...rest }) => {


  return (
    <Route
      {...rest}
      element={
        isLoggedIn ? (
          <div>
            <Sidebar onLogout={handleLogout} />
            <Userdetasils />
          </div>
        ) : (
          <Navigate to="/" />
        )
      }
    />
  );
};

export default PrivateRoute;
