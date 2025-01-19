import React, { useEffect, useContext, useState } from "react";
import { AlertContext } from "../context/AlertContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function Alert() {
  const { alertData, clearAlert } = useContext(AlertContext);
  const { alertMsg, alertType } = alertData;
  const [slide, setSlide] = useState(false);

  useEffect(() => {
    if (alertMsg) {
      requestAnimationFrame(() => setSlide(true));

      const timeout = setTimeout(() => {
        setSlide(false);
        clearAlert();
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [alertMsg, clearAlert]);

  if (!alertMsg) return null;

  return (
    <div
      className={`alert alert-${alertType} ${
        slide ? "show-alert" : "hide-alert"
      }`}
    >
      <FontAwesomeIcon
        icon={alertType === "success" ? faCircleCheck : faCircleXmark}
        className="icon"
      />
      {alertMsg}
    </div>
  );
}
