import React from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faMagnifyingGlass,
  faHouse,
  faGear,
  faArrowRightFromBracket,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";

import {
  faUser,
  faEnvelope,
  faBell,
  faHeart,
  faBookmark,
} from "@fortawesome/free-regular-svg-icons";

export default function Nav() {
  return (
    <div className="nav">
      <Link to="/home" className="nav-el">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faHouse} className="icon" />
        </div>
        <span>Home</span>
      </Link>

      <Link to="/search" className="nav-el">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="icon" />
        </div>
        <span>Discover</span>
      </Link>

      <Link to="/notifications" className="nav-el">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faBell} className="icon" />
        </div>
        <span>Notifications</span>
      </Link>

      <Link to="/messages" className="nav-el">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faEnvelope} className="icon" />
        </div>
        <span>Messasges</span>
      </Link>

      <Link to="/spotlists" className="nav-el nav-el-expanded">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faHeart} className="icon" />
        </div>
        <span>Spotlists</span>
      </Link>

      <Link to="/bookmarks" className="nav-el nav-el-expanded">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faBookmark} className="icon" />
        </div>
        <span>Bookmarks</span>
      </Link>

      <Link to="/friends" className="nav-el nav-el-expanded">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faUserGroup} className="icon" />
        </div>
        <span>Friends</span>
      </Link>

      <Link to="/settings" className="nav-el nav-el-expanded">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faGear} className="icon" />
        </div>
        <span>Profile Settings</span>
      </Link>

      <Link className="nav-el nav-el-expanded">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faArrowRightFromBracket} className="icon" />
        </div>
        <span>Log Out</span>
      </Link>

      <Link to="/account" className="nav-el">
        <div className="nav-el-svg-wrapper">
          <FontAwesomeIcon icon={faUser} className="icon" />
        </div>
        <span>Profile</span>
      </Link>
    </div>
  );
}
