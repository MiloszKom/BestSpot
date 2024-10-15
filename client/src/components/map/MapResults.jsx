import React, { useState, useContext } from "react";
import { ResultsContext } from "../context/ResultsContext";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faPersonWalking } from "@fortawesome/free-solid-svg-icons";

import { measureDistance } from "../utils/helperFunctions";
import { starRating } from "../utils/helperFunctions";

export default function MapResults({
  points,
  moreDetails,
  location,
  highlightedMarker,
  setShowNavbar,
}) {
  const results = useContext(ResultsContext);

  const deleteResults = () => {
    results.deleteResults();
    setShowNavbar(true);
  };

  const searchResults = points;

  const [sortOption, setSortOption] = useState(null);

  const modyfiedSearchResults = searchResults.map((result) => {
    const distance = measureDistance(location, result.geometry.location);
    return { ...result, distance }; // Spread the existing properties and add distance
  });

  const sortedResults = [...modyfiedSearchResults].sort((a, b) => {
    if (sortOption === "Most rated") {
      return b.user_ratings_total - a.user_ratings_total;
    } else if (sortOption === "Best rated") {
      return b.rating - a.rating;
    } else if (sortOption === "Distance") {
      return a.distance - b.distance; // Assuming you have 'distance' in the result data
    }
    return 0; // Default: no sorting
  });

  return (
    <div className="map-results">
      <div className="map-results-header">
        <h2>Results ({searchResults.length})</h2>
        <button className="map-results-btn" onClick={deleteResults}>
          <FontAwesomeIcon icon={faXmark} className="icon" />
        </button>
        <div className="map-results-sort">
          <div
            className={`sort-option ${
              sortOption === "Most rated" ? "active" : ""
            }`}
            onClick={() => setSortOption("Most rated")}
          >
            Most rated
          </div>
          <div
            className={`sort-option ${
              sortOption === "Best rated" ? "active" : ""
            }`}
            onClick={() => setSortOption("Best rated")}
          >
            Best rated
          </div>
          <div
            className={`sort-option ${
              sortOption === "Distance" ? "active" : ""
            }`}
            onClick={() => setSortOption("Distance")}
          >
            Distance
          </div>
        </div>
      </div>
      <div className="all-map-results">
        {sortedResults.length > 0 ? (
          sortedResults.map((result) => (
            <div
              className={`map-result ${
                highlightedMarker === result.place_id ? "highlight" : ""
              }`}
              data-id={result.place_id}
              key={result.place_id}
            >
              <div className="map-result-container">
                <div className="map-result-name">{result.name}</div>
                <div>
                  {result.rating}
                  {starRating(result.rating)}({result.user_ratings_total})
                </div>
                <div>
                  <FontAwesomeIcon icon={faPersonWalking} />
                  {` ${result.distance.toFixed(0)} m, `}
                  {result.vicinity}
                </div>
                {result.opening_hours?.open_now ? (
                  <div className="map-result-open">Open</div>
                ) : (
                  <div className="map-result-closed">Closed</div>
                )}
              </div>
              <div className="map-result-details">
                <Link to={result.place_id}>More Details</Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No results found. Try another search!</p>
          </div>
        )}
      </div>
    </div>
  );
}
