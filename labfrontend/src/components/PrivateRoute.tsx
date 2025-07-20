import { Navigate } from "react-router-dom";
import React, { useContext } from "react";
import { AuthContext } from "../utils/authContext";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useContext(AuthContext);
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#1976d2'
      }}>
        Loading...
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, show the children components
  return <>{children}</>;
} 