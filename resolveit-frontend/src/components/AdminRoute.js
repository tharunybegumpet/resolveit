import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { auth } = useContext(AuthContext);

  // Check if user is logged in and has admin role
  if (!auth.token || !auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (auth.user.role !== 'ADMIN') {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'red',
        fontSize: '18px'
      }}>
        <h2>🚫 Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
        <p>Current role: {auth.user.role}</p>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
    );
  }

  return children;
};

export default AdminRoute;