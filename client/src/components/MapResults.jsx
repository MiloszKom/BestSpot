import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faStarHalfStroke } from "@fortawesome/free-solid-svg-icons";
import { faStar as emptyStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as filledStar } from "@fortawesome/free-solid-svg-icons";

export default function mapResults({ points, setSearchResults, moreDetails }) {
  const deleteResults = () => {
    setSearchResults(null);
  };
  const searchResults = points;

  const starRating = (rating) => {
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
  };
  return (
    <div className="map-results">
      <div className="map-results-header">
        <h2>Results</h2>
        <button className="map-results-btn" onClick={deleteResults}>
          <FontAwesomeIcon icon={faXmark} className="icon" />
        </button>
      </div>
      <div className="all-map-results">
        {searchResults.map((result) => (
          <div className="map-result">
            <div className="map-result-container">
              <div className="map-result-name">{result.name}</div>
              <div>
                {result.rating}
                {starRating(result.rating)}({result.user_ratings_total})
              </div>
              <div>{result.vicinity}</div>
              {result.opening_hours?.open_now ? (
                <div className="map-result-open">Open</div>
              ) : (
                <div className="map-result-closed">Closed</div>
              )}
            </div>
            <div className="map-result-details">
              <button onClick={() => moreDetails(result.place_id)}>
                More Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
