import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";

export default function Alert({ msg, type }) {
  const [slide, setSlide] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (msg) setSlide(true);
    });

    const timeout = setTimeout(() => {
      setSlide(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [type, msg]);

  return (
    <div
      className={`alert alert-${type} ${slide ? "show-alert" : "hide-alert"}`}
    >
      <FontAwesomeIcon
        icon={type === "success" ? faCircleCheck : faCircleXmark}
        className="icon"
      />
      {msg}
    </div>
  );
}
