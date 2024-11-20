import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
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
  faEarthAmerica,
  faLock,
  faHeart,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";

import { starRating } from "../utils/helperFunctions";
import {
  fetchFromDatabase,
  fetchFromApi,
  saveSpotToDatabse,
  getNearestTime,
} from "../utils/spotUtils";

export default function SpotDetail({ setShowNavbar }) {
  const [imageError, setImageError] = useState(false);
  const [imgMargin, setImgMargin] = useState(0);

  const [showHours, setShowHours] = useState(false);

  const [placeDetails, setPlaceDetails] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Public");
  const [placeNote, setPlaceNote] = useState("");

  const [justFetched, setJustFetched] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  const [alsoSavedBy, setAlsoSavedBy] = useState(null);

  const auth = useContext(AuthContext);
  const params = useParams();

  useEffect(() => {
    setShowNavbar(false);
    return () => {
      setShowNavbar(true);
    };
  }, [setShowNavbar]);

  useEffect(() => {
    fetchFromDatabase(
      params.id,
      setPlaceDetails,
      setIsFavourite,
      setPlaceNote,
      setJustFetched,
      setAlsoSavedBy,
      fetchFromApi
    );
  }, [params.id]);

  useEffect(() => {
    if (placeDetails && justFetched) saveSpotToDatabse(placeDetails, auth);
  }, [placeDetails, justFetched]);

  const nextImg = (direction) => {
    if (direction === "right") {
      setImgMargin((imgMargin) => {
        return imgMargin + 100;
      });
    }
    if (direction === "left") {
      setImgMargin((imgMargin) => {
        return imgMargin - 100;
      });
    }
  };

  const toggleHours = () => {
    setShowHours(!showHours);
  };

  const addToFavourites = async () => {
    try {
      const res = await axios({
        method: "POST",
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/favourites/${placeDetails._id}`,
        withCredentials: true,
        data: {
          note: placeNote,
          privacyOption: selectedOption,
        },
      });

      console.log(res);
    } catch (err) {
      console.log(err);
    }
    setIsFavourite(true);
    hideNote();
  };

  const removeFromFavourites = async () => {
    try {
      const res = await axios({
        method: "DELETE",
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/favourites/${placeDetails._id}`,
        withCredentials: true,
      });
      console.log(res);
    } catch (err) {
      console.log(err);
    }
    setIsFavourite(false);
  };

  const addNote = () => {
    const spotDetail = document.querySelector(".spot-detail");
    spotDetail.style.opacity = ".4";
    spotDetail.style.overflowY = "hidden";

    const popup = document.querySelector(".popup-container");
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.opacity = "1";
    popup.style.pointerEvents = "all";
  };

  const hideNote = () => {
    const spotDetail = document.querySelector(".spot-detail");
    spotDetail.style.opacity = "1";
    spotDetail.style.overflowY = "auto";

    const popup = document.querySelector(".popup-container");
    popup.style.transform = "translate(-50%, -20%)";
    popup.style.opacity = "0";
    popup.style.pointerEvents = "none";
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  if (placeNote === "") setPlaceNote("Added to favourites");

  if (!placeDetails) return <div className="loader"></div>;

  const photoUrl = justFetched
    ? ""
    : `http://${process.env.REACT_APP_SERVER}:5000/uploads/images/`;

  return (
    <>
      <div className="spot-detail">
        <div className="spot-detail-wrapper">
          <div
            className="spot-detail-carousel"
            style={{ transform: `translateX(-${imgMargin}%)` }}
          >
            {placeDetails.photos ? (
              placeDetails.photos.map((photo) => (
                <div
                  className="spot-detail-img"
                  style={{
                    backgroundImage: `url(${photoUrl}${photo})`,
                  }}
                ></div>
              ))
            ) : (
              <div
                className="spot-detail-img"
                style={{
                  backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/no-img-found.jpg)`,
                }}
              ></div>
            )}
          </div>
          <Link
            to=".."
            relative="path"
            className="spot-detail-img-btn spot-detail-btn"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </Link>
          {placeDetails.photos && placeDetails.photos.length > 1 && (
            <div className="spot-detail-controlls">
              <div
                className={`spot-detail-btn ${
                  imgMargin === 0 ? "disabled" : ""
                }`}
                onClick={() => nextImg("left")}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </div>
              <div
                className={`spot-detail-btn ${
                  imgMargin === 100 * placeDetails.photos.length - 100
                    ? "disabled"
                    : ""
                }`}
                onClick={() => nextImg("right")}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </div>
            </div>
          )}
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
            <div className="spot-detail-info-el" onClick={toggleHours}>
              <div className="icon">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <p>
                {!showHours && <>{getNearestTime(placeDetails)}</>}
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
              {placeDetails.current_opening_hours.weekday_text.map(
                (day, index) => {
                  const [dayName, hours] = day.split(": ");

                  return (
                    <div
                      key={index}
                      className="spot-detail-info-el opening-hours"
                    >
                      <span>{dayName}:</span> {hours}
                    </div>
                  );
                }
              )}
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
          {placeDetails.international_phone_number && (
            <div className="spot-detail-info-el">
              <div className="icon">
                <FontAwesomeIcon icon={faPhone} />
              </div>
              <p>{placeDetails.international_phone_number}</p>
            </div>
          )}
          {isFavourite && (
            <div className="spot-detail-info-el">
              <div className="icon icon-pink">
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <p>{placeNote ? placeNote : "Saved to favourites"}</p>
            </div>
          )}

          {alsoSavedBy?.length > 0 && (
            <>
              <div className="spot-detail-info-el">
                <div className="icon">
                  <FontAwesomeIcon icon={faUserFriends} />
                </div>
                <p>Saved by Friends</p>
              </div>

              {alsoSavedBy.map((friend) => {
                return (
                  <div className="friend-favourited">
                    <div className="friend-favourited-header">
                      <div
                        className="friend-favourited-header-img"
                        style={{
                          backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${friend.userId.photo})`,
                        }}
                      ></div>
                      <div>{friend.userId.name}</div>
                    </div>
                    <div className="friend-favourited-note">{friend.note}</div>
                  </div>
                );
              })}
            </>
          )}
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
            <a
              href={placeDetails.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>View in Google Maps</div>
            </a>
            {isFavourite ? (
              <div className="add-favorite-btn" onClick={removeFromFavourites}>
                Remove from favourites
              </div>
            ) : (
              <div className="add-favorite-btn-2" onClick={addNote}>
                Add to favourites
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="popup-container">
        <div className="popup-container-body">
          <span>Add to favourites</span>
          <p className="title">Visibility</p>
          <div className="privacy-options">
            <div
              className={`privacy-options-el ${
                selectedOption === "Public" ? "selected" : ""
              }`}
              onClick={() => handleOptionClick("Public")}
            >
              <p>Public</p>
              <FontAwesomeIcon icon={faEarthAmerica} />
            </div>
            <div
              className={`privacy-options-el ${
                selectedOption === "Private" ? "selected" : ""
              }`}
              onClick={() => handleOptionClick("Private")}
            >
              <p>Private</p>
              <FontAwesomeIcon icon={faLock} />
            </div>
          </div>

          <p className="title">Add a note</p>
          <textarea
            className="note"
            value={placeNote}
            onChange={(e) => setPlaceNote(e.target.value)}
          />
        </div>

        <div className="popup-container-footer">
          <div className="button" onClick={hideNote}>
            Cancel
          </div>
          <div className="button" onClick={addToFavourites}>
            Create
          </div>
        </div>
      </div>
    </>
  );
}
