import React, { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faLocationDot,
  faChevronLeft,
  faClock,
  faPhone,
  faGlobe,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";

import { starRating } from "./helperFunctions";

// import img1 from "./img/jpg1.jpg";
// import img2 from "./img/jpg2.jpg";
// import img3 from "./img/jpg3.jpg";
export default function SpotDetail({ placePhotos, placeDetails, lessDetails }) {
  const [imageError, setImageError] = useState(false);

  const [imgMargin, setImgMargin] = useState(0);
  const [showHours, setShowHours] = useState(false);

  const nextImg = (direction) => {
    if (direction === "right") {
      if (imgMargin > 100) return;
      setImgMargin((imgMargin) => {
        return imgMargin + 100;
      });
    }
    if (direction === "left") {
      if (imgMargin === 0) return;
      setImgMargin((imgMargin) => {
        return imgMargin - 100;
      });
    }
  };

  const handleClick = () => {
    setShowHours(!showHours);
  };

  function formatTime(time) {
    const hours = time.slice(0, 2);
    const minutes = time.slice(2);
    return `${hours}:${minutes}`;
  }

  const getNearestTime = () => {
    console.log("1");
    let periods = placeDetails.current_opening_hours.periods;
    console.log("2");
    if (!periods) return;
    console.log("3");

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    if (!periods[currentDay]) {
      return console.log("Not Operating Today");
    }

    if (currentTime < periods[currentDay].open.time) {
      return `Opens ${formatTime(periods[currentDay].open.time)}`;
    } else if (currentTime < periods[currentDay].close.time) {
      return `Closes ${formatTime(periods[currentDay].close.time)}`;
    } else return `Closed `;
  };

  return (
    <div className="spot-detail">
      <div className="spot-detail-wrapper">
        <div className="spot-detail-carousel">
          <div
            className="spot-detail-img"
            style={{
              backgroundImage: `url(${placePhotos[0]})`,
              marginLeft: `-${imgMargin}%`,
            }}
          ></div>
          <div
            className="spot-detail-img"
            style={{
              backgroundImage: `url(${placePhotos[1]})`,
              marginLeft: `-${imgMargin}%`,
            }}
          ></div>
          <div
            className="spot-detail-img"
            style={{
              backgroundImage: `url(${placePhotos[2]})`,
              marginLeft: `-${imgMargin}%`,
            }}
          ></div>
        </div>
        <div
          className="spot-detail-img-btn spot-detail-btn"
          onClick={lessDetails}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </div>
        <div className="spot-detail-controlls">
          <div
            className={`spot-detail-btn ${imgMargin === 0 ? "disabled" : ""}`}
            onClick={() => nextImg("left")}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
          <div
            className={`spot-detail-btn ${imgMargin > 100 ? "disabled" : ""}`}
            onClick={() => nextImg("right")}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </div>
        </div>
      </div>
      <div className="padding-container">
        <h2 className="spot-detail-name">{placeDetails.name}</h2>
        <div>
          {placeDetails.rating} {starRating(placeDetails.rating)} (
          {placeDetails.user_ratings_total})
        </div>
      </div>

      <div className="spot-detail-info">
        <div className="spot-detail-info-el">
          <div className="icon">
            <FontAwesomeIcon icon={faLocationDot} />
          </div>
          <p>{placeDetails.vicinity}</p>
        </div>
        {placeDetails.current_opening_hours && (
          <div className="spot-detail-info-el" onClick={handleClick}>
            <div className="icon">
              <FontAwesomeIcon icon={faClock} />
            </div>
            <p>
              {placeDetails.opening_hours?.open_now ? (
                <span className="map-result-open">Open</span>
              ) : (
                <span className="map-result-closed">Closed</span>
              )}
              {!showHours && <> &middot; {getNearestTime()}</>}
              {showHours ? (
                <FontAwesomeIcon icon={faChevronUp} className="downArrow" />
              ) : (
                <FontAwesomeIcon icon={faChevronDown} className="downArrow" />
              )}
            </p>
          </div>
        )}
        {showHours && (
          <>
            {placeDetails.opening_hours.weekday_text.map((day, index) => {
              const [dayName, hours] = day.split(": ");

              return (
                <div key={index} className="spot-detail-info-el opening-hours">
                  <span>{dayName}:</span> {hours}
                </div>
              );
            })}
          </>
        )}
        {placeDetails.website && (
          <div className="spot-detail-info-el">
            <div className="icon">
              <FontAwesomeIcon icon={faGlobe} />
            </div>
            <p>
              <a
                href={placeDetails.website}
                className="website-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {placeDetails.website}
              </a>
            </p>
          </div>
        )}
        <div className="spot-detail-info-el">
          <div className="icon">
            <FontAwesomeIcon icon={faPhone} />
          </div>
          <p>{placeDetails.international_phone_number}</p>
        </div>
      </div>

      <div className="spot-detail-reviews">
        <h2 className="spot-detail-name">Reviews</h2>
        {placeDetails.reviews.map((review) => {
          return (
            <div className="spot-detail-review-el">
              <div className="review-header">
                {imageError ? (
                  <FontAwesomeIcon icon={faUser} className="icon" />
                ) : (
                  <img
                    src={review.profile_photo_url}
                    alt="User profile"
                    onError={() => setImageError(true)}
                  />
                )}

                <span>{review.author_name}</span>
              </div>
              <div className="review-stars">
                <div>{starRating(review.rating)}</div>
                <div className="review-date">
                  {review.relative_time_description}
                </div>
              </div>
              <div>{review.text}</div>
            </div>
          );
        })}

        <div className="spot-detail-footer">
          <a href={placeDetails.url} target="_blank" rel="noopener noreferrer">
            <div>View in Google Maps</div>
          </a>
          <div className="add-favorite-btn">Add to favourites</div>
        </div>
      </div>
    </div>
  );
}
