import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RedirectRoute({ children }) {
  const { isLoggedIn, isDataFetched } = useContext(AuthContext);

  if (isDataFetched === false) {
    return <div className="loader big" />;
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
}
