import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faGear,
  faArrowRightFromBracket,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

import { faHeart, faBookmark } from "@fortawesome/free-regular-svg-icons";

export default function Sidenav({ setShowMenu }) {
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
      <div className="sidebar-el">
        <div
          className="sidebar-el-svg-wrapper"
          onClick={() => setShowMenu(false)}
        >
          <FontAwesomeIcon icon={faGear} />
        </div>
        <span>Profile Settings</span>
      </div>
      <div className="sidebar-el">
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
