import { Navigate } from "react-router-dom";
 
export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const isLoggedIn = !!localStorage.getItem("token");
  return isLoggedIn ? children : <Navigate to="/login" replace />;
} 