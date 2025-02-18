import React, { useState, useContext } from "react";
import Header from "../common/Header";
import Nav from "../common/Nav";
import Sidenav from "../common/Sidenav";
import { Outlet } from "react-router-dom";
import SidePannel from "./SidePannel";

import { AuthContext } from "../context/AuthContext";

import { useQuery } from "@tanstack/react-query";
import { getGlobalNotifications } from "../api/notificationsApis";

export default function Layout() {
  const [showMenu, setShowMenu] = useState(false);
  const auth = useContext(AuthContext);

  const { data } = useQuery({
    queryKey: ["globalNotificationsHeader"],
    queryFn: getGlobalNotifications,
    enabled: !!auth.isLoggedIn,
  });

  const notifications = data?.data;

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
