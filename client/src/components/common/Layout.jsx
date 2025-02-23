import React, { useState, useContext, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import Header from "../common/Header";
import Nav from "../common/Nav";
import Sidenav from "../common/Sidenav";
import SidePannel from "./SidePannel";

import { AuthContext } from "../context/AuthContext";
import { getGlobalNotifications } from "../api/notificationsApis";

export default function Layout() {
  const [showMenu, setShowMenu] = useState(false);
  const auth = useContext(AuthContext);
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["globalNotificationsHeader"],
    queryFn: getGlobalNotifications,
    enabled: !!auth.isLoggedIn,
  });

  const notifications = data?.data;

  useEffect(() => {
    if (auth.isLoggedIn) {
      queryClient.invalidateQueries(["globalNotificationsHeader"]);
    }
  }, [location.pathname, queryClient, auth.isLoggedIn]);

  return (
    <div className="container">
      <Header setShowMenu={setShowMenu} />
      <div className="content">
        <Outlet />
        <SidePannel />
      </div>
      <Nav notifications={notifications} auth={auth} />
      {showMenu && <Sidenav setShowMenu={setShowMenu} auth={auth} />}
      {showMenu && (
        <div className="sidebar-overlay" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}
