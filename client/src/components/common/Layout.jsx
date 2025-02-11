import React, { useState } from "react";
import Header from "../common/Header"; // Assuming the path is correct
import Nav from "../common/Nav"; // Assuming the path is correct
import Sidenav from "../common/Sidenav"; // Assuming the path is correct
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="container">
      <Header setShowMenu={setShowMenu} />
      <div className="content">
        <Outlet />
        <div className="sidePanel">Side panel</div>
      </div>
      <Nav />
      {showMenu && <Sidenav setShowMenu={setShowMenu} />}
      {showMenu && (
        <div className="sidebar-overlay" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}
