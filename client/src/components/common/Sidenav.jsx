import React, { useContext } from "react";
import { NavLink } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faArrowRightFromBracket,
  faCirclePlus,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

import { faBookmark } from "@fortawesome/free-regular-svg-icons";

import { logout } from "../utils/helperFunctions";

export default function Sidenav({ setShowMenu }) {
  const auth = useContext(AuthContext);

  return (
    <div className="sidebar-nav">
      <NavLink
        to="/bookmarks"
        className="sidebar-el"
        onClick={() => setShowMenu(false)}
      >
        <div
          className="sidebar-el-svg-wrapper"
          onClick={() => setShowMenu(false)}
        >
          <FontAwesomeIcon icon={faBookmark} />
        </div>
        <span>Bookmarks</span>
      </NavLink>
      <NavLink
        to="/friends"
        className="sidebar-el"
        onClick={() => setShowMenu(false)}
      >
        <div className="sidebar-el-svg-wrapper">
          <FontAwesomeIcon icon={faUserGroup} />
        </div>
        <span>Friends</span>
      </NavLink>
      <NavLink
        to="/create"
        className="sidebar-el create"
        onClick={() => setShowMenu(false)}
      >
        <div className="sidebar-el-svg-wrapper">
          <FontAwesomeIcon icon={faCirclePlus} />
        </div>
        <span>Create</span>
      </NavLink>
      {auth.isLoggedIn ? (
        <div className="sidebar-el" onClick={() => logout(auth)}>
          <div
            className="sidebar-el-svg-wrapper"
            onClick={() => setShowMenu(false)}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </div>
          <span>Log out</span>
        </div>
      ) : (
        <NavLink to="/login" className="sidebar-el">
          <div
            className="sidebar-el-svg-wrapper"
            onClick={() => setShowMenu(false)}
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
          </div>
          <span>Log in</span>
        </NavLink>
      )}
    </div>
  );
}
