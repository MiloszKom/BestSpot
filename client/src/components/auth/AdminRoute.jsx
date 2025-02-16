import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function AdminRoute({ children, message }) {
  const { isDataFetched, userData } = useContext(AuthContext);
  const location = useLocation();

  if (isDataFetched === false) {
    return <div className="loader" />;
  }

  if (userData?.role !== "admin") {
    return <Navigate to="/login" state={{ from: location, message }} replace />;
  }

  return children;
}
