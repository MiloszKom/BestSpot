import React from "react";
import { NavLink, Outlet } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

export default function FriendsPage() {
  return (
    <div className="friends-container">
      <div className="friends-header">Friends</div>
      <div className="social-nav">
        <NavLink
          to="/friends"
          end
          className={({ isActive }) =>
            isActive ? "social-nav-el active" : "social-nav-el"
          }
        >
          Friend List
        </NavLink>
        <NavLink
          to="/friends/requests"
          className={({ isActive }) =>
            isActive ? "social-nav-el active" : "social-nav-el"
          }
        >
          Friend Requests
        </NavLink>
        <NavLink to="/search-bar" className="social-nav-el search">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
