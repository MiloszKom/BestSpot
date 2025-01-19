import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Assuming the path is correct

export default function PrivateRoute({ children }) {
  const { isDataFetched, userData } = useContext(AuthContext);

  if (isDataFetched === false) {
    return <div>Loading...</div>;
  } else {
    return userData ? children : <Navigate to="/login" replace />;
  }
}
