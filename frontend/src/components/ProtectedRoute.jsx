import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ProtectedRoute Component - Practical Exam Set E
// Checks if token/customer exists. If authenticated, renders children or Outlet.
// If unauthenticated, redirects to LoginPage (/)
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
