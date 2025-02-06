import React from "react";
import { Link } from "react-router-dom";

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

      <Link to="/notifications">
        <div className="header-svg-wrapper" onClick={() => setShowMenu(false)}>
          <FontAwesomeIcon icon={faBell} />
        </div>
      </Link>
    </div>
  );
}
