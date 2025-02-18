import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="error-page-container">
      <div className="error-page-body">
        <div className="error-page-status">404</div>
        <div className="error-page-type">Not Found</div>
        <div className="error-page-message">
          The page you're looking for doesn't exist
        </div>
        <Link to="/" className="home-button">
          Return Home
        </Link>
      </div>
    </div>
  );
}
