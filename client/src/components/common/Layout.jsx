import React, { useState } from "react";
import Header from "../common/Header";
import Nav from "../common/Nav";
import Sidenav from "../common/Sidenav";
import { Outlet } from "react-router-dom";
import SidePannel from "./SidePannel";

export default function Layout() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="container">
      <Header setShowMenu={setShowMenu} />
      <div className="content">
        <Outlet />
        <SidePannel />
      </div>
      <Nav />
      {showMenu && <Sidenav setShowMenu={setShowMenu} />}
      {showMenu && (
        <div className="sidebar-overlay" onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}
