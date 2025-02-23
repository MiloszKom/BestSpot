import React from "react";
import { Link } from "react-router-dom";

export default function ErrorPage({ error }) {
  const errorStatusMapping = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    429: "Too Many Requests",
  };

  const errorStatusType = errorStatusMapping[error.status] || "Error";
  const errorMessage =
    error.response?.data?.message || "An unexpected error occurred";

  return (
    <div className="error-page-container">
      <div className="error-page-body">
        <div className="error-page-status">{error.status}</div>
        <div className="error-page-type">{errorStatusType}</div>
        <div className="error-page-message">{errorMessage}</div>
        <Link to="/" className="home-button">
          Return Home
        </Link>
      </div>
    </div>
  );
}
