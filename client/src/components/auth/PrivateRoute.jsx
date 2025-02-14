import React, { useContext } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PrivateRoute({ children, message }) {
  const { isDataFetched, userData } = useContext(AuthContext);
  const location = useLocation();

  console.log("isDataFetched ", isDataFetched);

  if (isDataFetched === false) {
    return <div className="loader" />;
  }

  if (!userData) {
    return <Navigate to="/login" state={{ from: location, message }} replace />;
  }

  return children ? children : <Outlet />;
}
