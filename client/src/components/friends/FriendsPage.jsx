import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function FriendsPage() {
  return (
    <div className="friends-container">
      <div className="friends-header">
        <NavLink
          to="/friends"
          end
          className={({ isActive }) =>
            isActive ? "friends-header-el active" : "friends-header-el"
          }
        >
          Friend List
        </NavLink>
        <NavLink
          to="/friends/requests"
          className={({ isActive }) =>
            isActive ? "friends-header-el active" : "friends-header-el"
          }
        >
          Friend Requests
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
