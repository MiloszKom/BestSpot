import React from "react";
import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import { faBell } from "@fortawesome/free-regular-svg-icons";
import { getGlobalNotifications } from "../api/notificationsApis";

export default function Header({ setShowMenu }) {
  const { data } = useQuery({
    queryKey: ["globalNotificationsHeader"],
    queryFn: getGlobalNotifications,
  });

  const notifications = data?.data;

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
        {notifications?.unreadNotifications > 0 && (
          <div className="alert-badge">
            {notifications.unreadNotifications > 9
              ? "9+"
              : notifications.unreadNotifications}
          </div>
        )}
      </NavLink>
    </div>
  );
}
