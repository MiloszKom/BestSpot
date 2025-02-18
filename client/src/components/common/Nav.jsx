import React from "react";
import { NavLink, useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faHouse,
  faArrowRightFromBracket,
  faUserGroup,
  faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";

import {
  faUser,
  faEnvelope,
  faBell,
  faHeart,
  faBookmark,
  faCompass,
  faFlag,
} from "@fortawesome/free-regular-svg-icons";

import { logout } from "../utils/helperFunctions";

export default function Nav({ notifications, auth }) {
  const location = useLocation();

  return (
    <div className="nav">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive || location.pathname === "/create-post"
            ? "nav-el active"
            : "nav-el"
        }
      >
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faHouse} className="icon" />
        </div>
        <span>Home</span>
      </NavLink>

      <NavLink to="/discover" className="nav-el">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faCompass} className="icon" />
        </div>
        <span>Discover</span>
      </NavLink>

      <NavLink to="/spotlists" className="nav-el">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faHeart} className="icon" />
        </div>
        <span>Spotlists</span>
      </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) =>
          isActive || location.pathname === "/requests"
            ? "nav-el active"
            : "nav-el"
        }
      >
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faEnvelope} className="icon" />
        </div>
        <span>Messages</span>
      </NavLink>

      <NavLink to="/notifications" className="nav-el nav-el-expanded">
        <div className="nav-el-svg-wrapper nav-el-expanded">
          <FontAwesomeIcon icon={faBell} className="icon" />
          {notifications?.unreadNotifications > 0 && (
            <div className="alert-badge">
              {notifications.unreadNotifications > 9
                ? "9+"
                : notifications.unreadNotifications}
            </div>
          )}
        </div>
        <span>Notifications</span>
      </NavLink>

      <NavLink to="/bookmarks" className="nav-el nav-el-expanded">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faBookmark} className="icon" />
        </div>
        <span>Bookmarks</span>
      </NavLink>

      <NavLink to="/friends" className="nav-el nav-el-expanded">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faUserGroup} className="icon" />
          {notifications?.pendingRequests > 0 && (
            <div className="alert-badge">
              {notifications.pendingRequests > 9
                ? "9+"
                : notifications.pendingRequests}
            </div>
          )}
        </div>
        <span>Friends</span>
      </NavLink>

      <NavLink
        to={`/${auth.userData?.handle || "login"}`}
        className={({ isActive }) =>
          isActive && location.pathname !== "/login"
            ? "nav-el active"
            : "nav-el"
        }
      >
        <div className="nav-el-svg-wrapper">
          {auth.userData?.photo ? (
            <div
              className="nav-photo"
              style={{
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${auth.userData?.photo})`,
              }}
            />
          ) : (
            <div className="nav-el-svg-wrapper">
              <FontAwesomeIcon icon={faUser} className="icon" />
            </div>
          )}
        </div>
        <span>Profile</span>
      </NavLink>

      <NavLink to="/create-spot" className="nav-el nav-el-expanded create">
        <div className="nav-el-svg-wrapper create">
          <FontAwesomeIcon icon={faCirclePlus} className="icon" />
        </div>
        <span>Create</span>
      </NavLink>

      {auth.userData?.role === "admin" && (
        <NavLink to="/reports" className="nav-el nav-el-expanded">
          <div className="nav-el-svg-wrapper">
            <FontAwesomeIcon icon={faFlag} className="icon" />
          </div>
          <span>Reports</span>
        </NavLink>
      )}

      {auth.isLoggedIn ? (
        <div className="nav-el nav-el-expanded" onClick={() => logout(auth)}>
          <div className="nav-el-svg-wrapper">
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="icon" />
          </div>
          <span>Log Out</span>
        </div>
      ) : (
        <NavLink to="/login" className="nav-el nav-el-expanded">
          <div className="nav-el-svg-wrapper">
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="icon" />
          </div>
          <span>Log In</span>
        </NavLink>
      )}
    </div>
  );
}
