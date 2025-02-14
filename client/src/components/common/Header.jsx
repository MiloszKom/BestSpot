import React from "react";
import { NavLink } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import { faBell } from "@fortawesome/free-regular-svg-icons";

export default function Header({ setShowMenu }) {
  return (
    <div className="header">
      <div
        className="header-svg-wrapper"
        onClick={() => setShowMenu((prevMenu) => !prevMenu)}
      >
        <FontAwesomeIcon icon={faBars} />
      </div>
      <span>BestSpot</span>

      <NavLink
        to="/notifications"
        className="header-svg-wrapper"
        onClick={() => setShowMenu(false)}
      >
        <FontAwesomeIcon icon={faBell} />
      </NavLink>
    </div>
  );
}
