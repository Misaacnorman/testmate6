import { Navigate } from "react-router-dom";
 
import React from "react";
export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
} 