import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { faStar as emptyStar } from "@fortawesome/free-regular-svg-icons";
import {
  faStar as filledStar,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

export function measureDistance(position1, position2) {
  const R = 6371e3; // metres
  const φ1 = (position1.lat * Math.PI) / 180; // φ, λ in radians
  const φ2 = (position2.lat * Math.PI) / 180;
  const Δφ = ((position2.lat - position1.lat) * Math.PI) / 180;
  const Δλ = ((position2.lng - position1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres

  return d;
}

export function starRating(rating) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FontAwesomeIcon key={i} icon={filledStar} />);
    } else if (rating >= i - 0.5) {
      stars.push(<FontAwesomeIcon key={i} icon={faStarHalfStroke} />);
    } else {
      stars.push(<FontAwesomeIcon key={i} icon={emptyStar} />);
    }
  }

  return stars;
}

export const checkCookies = async () => {
  try {
    const res = await axios({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/checkCookies`,
      withCredentials: true,
    });

    console.log(res.data);
    if (res.data.status === "success") return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const formatTime = (date) => {
  const time = new Date(date);
  const year = String(time.getFullYear());
  const month = String(time.getMonth() + 1).padStart(2, "0");
  const day = String(time.getDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
};

export const compareTime = (date1, date2) => {
  if (date1.split("/")[0] > date2.split("/")[0]) {
    return true;
  } else if (date1.split("/")[1] > date2.split("/")[1]) {
    return true;
  } else if (date1.split("/")[2 > date2.split("/")[2]]) {
    return true;
  } else {
    return false;
  }
};

export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const timeDiff = now - new Date(timestamp);
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return `${days} day ago`;
  if (days < 7) return `${days} days ago`;

  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(timestamp).toLocaleDateString(undefined, options);
};

export function formatPostTimestamp(timestamp) {
  const date = new Date(timestamp);

  const options = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const time = new Intl.DateTimeFormat("en-US", options).format(date);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${time} · ${month} ${day}, ${year}`;
}
