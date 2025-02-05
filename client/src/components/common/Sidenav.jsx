import React, { useContext } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faArrowRightFromBracket,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

import { faHeart, faBookmark } from "@fortawesome/free-regular-svg-icons";

import { logout } from "../utils/helperFunctions";

export default function Sidenav({ setShowMenu }) {
  const auth = useContext(AuthContext);

  return (
    <div className="sidebar-nav">
      <Link
        to="/spotlists"
        className="sidebar-el"
        onClick={() => setShowMenu(false)}
      >
        <div className="sidebar-el-svg-wrapper">
          <FontAwesomeIcon icon={faHeart} />
        </div>
        <span>Spotlists</span>
      </Link>
      <Link
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
      </Link>
      <Link
        to="/friends"
        className="sidebar-el"
        onClick={() => setShowMenu(false)}
      >
        <div className="sidebar-el-svg-wrapper">
          <FontAwesomeIcon icon={faUserGroup} />
        </div>
        <span>Friends</span>
      </Link>
      <div className="sidebar-el" onClick={() => logout(auth)}>
        <div
          className="sidebar-el-svg-wrapper"
          onClick={() => setShowMenu(false)}
        >
          <FontAwesomeIcon icon={faArrowRightFromBracket} />
        </div>
        <span>Log out</span>
      </div>
    </div>
  );
}
