import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Outlet } from "react-router-dom";

export default function PublicRoute({ children }) {
  const auth = useContext(AuthContext);

  if (auth.isDataFetched === false) {
    return <div className="loader" />;
  }

  return children ? children : <Outlet />;
}
