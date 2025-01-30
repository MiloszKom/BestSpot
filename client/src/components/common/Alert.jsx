import React, { useEffect, useContext, useState, useRef } from "react";
import { AlertContext } from "../context/AlertContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function Alert() {
  const { alertData, clearAlert } = useContext(AlertContext);
  const { alertMsg, alertType } = alertData;
  const [slide, setSlide] = useState(false);

  const barRef = useRef(null);

  useEffect(() => {
    if (!alertMsg) return;

    setSlide(true);
    if (barRef.current) {
      barRef.current.style.animation = "none";
      void barRef.current.offsetWidth;
      barRef.current.style.animation = "";
    }

    const timeout = setTimeout(() => {
      setSlide(false);
      setTimeout(() => {
        clearAlert();
      }, 500);
    }, 2500);

    return () => clearTimeout(timeout);
  }, [alertMsg, clearAlert]);

  return (
    <div
      className={`alert alert-${alertType} ${
        slide ? "show-alert" : "hide-alert"
      }`}
    >
      <div className="alert-content">
        <FontAwesomeIcon
          icon={alertType === "success" ? faCircleCheck : faCircleXmark}
          className="icon"
          style={{
            color: alertType === "success" ? "#20bf6b" : "#d5372f",
          }}
        />
        <span>{alertMsg}</span>
        <button onClick={() => setSlide(false)}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
      <div
        className="alert-bar"
        ref={barRef}
        style={{
          backgroundColor: alertType === "success" ? "#20bf6b" : "#d5372f",
        }}
      />
    </div>
  );
}
