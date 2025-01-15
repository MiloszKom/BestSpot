import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  faHeart,
  faUserFriends,
} from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";

import { starRating } from "../utils/helperFunctions";
import {
  fetchFromDatabase,
  fetchFromApi,
  getNearestTime,
} from "../utils/spotUtils";

import AddToSpotlist from "./components/AddToSpotlist";
import CreateNewSpotlist from "./components/CreateNewSpotlist";
import AddNote from "./components/AddNote";

export default function SpotDetail() {
  const [imageError, setImageError] = useState(false);

  const [showHours, setShowHours] = useState(false);

  const [placeDetails, setPlaceDetails] = useState(null);
  const [placeNote, setPlaceNote] = useState("");
  const [isFavourite, setIsFavourite] = useState(false);
  const [spotlistId, setSpotlistId] = useState(null);
  const [alsoSavedBy, setAlsoSavedBy] = useState(null);

  const [addingNote, setAddingNote] = useState(false);
  const [addingToSpotlist, setAddingToSpotlist] = useState(false);
  const [creatingNewSpotlist, setCreatingNewSpotlist] = useState(false);

  const { showAlert } = useContext(AlertContext);
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFromDatabase(
      params.id,
      setPlaceDetails,
      setPlaceNote,
      setIsFavourite,
      setAlsoSavedBy,
      setSpotlistId,
      fetchFromApi
    );
  }, [params.id]);

  const toggleHours = () => {
    setShowHours(!showHours);
  };

  const saveToSpotlist = () => {
    setAddingToSpotlist(true);
  };

  if (!placeDetails) return <div className="loader"></div>;

  return (
    <>
      <div className="spot-detail">
        <div className="spot-detail-body">
          <div className="spot-detail-wrapper">
            <div className="spot-detail-carousel">
              <div
                className="spot-detail-img"
                style={{
                  backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${placeDetails.photo})`,
                }}
              ></div>
            </div>
            <div
              onClick={() => navigate(-1)}
              className="spot-detail-img-btn spot-detail-btn"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
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
              <div className="spot-detail-info-el" onClick={toggleHours}>
                <div className="icon">
                  <FontAwesomeIcon icon={faClock} />
                </div>
                <p>
                  {!showHours && <>{getNearestTime(placeDetails)}</>}
                  {showHours ? (
                    <FontAwesomeIcon icon={faChevronUp} className="downArrow" />
                  ) : (
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className="downArrow"
                    />
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
                {placeNote ? (
                  <div className="note">
                    <div className="note-content">{placeNote}</div>
                    <div
                      className="note-edit"
                      onClick={() => setAddingNote(true)}
                    >
                      Edit Note
                    </div>
                  </div>
                ) : (
                  <div className="note">
                    <div className="note-content">Saved</div>
                    <div
                      className="note-edit"
                      onClick={() => setAddingNote(true)}
                    >
                      Add Note
                    </div>
                  </div>
                )}
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
                            backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${friend.photo})`,
                          }}
                        ></div>
                        <div>{friend.name}</div>
                      </div>
                      <div className="friend-favourited-note">
                        {friend.note}
                      </div>
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
          </div>
        </div>
        <div className="spot-detail-footer">
          <a href={placeDetails.url} target="_blank" rel="noopener noreferrer">
            <div>View in Google Maps</div>
          </a>
          {isFavourite ? (
            <div className="add-favorite-btn" onClick={saveToSpotlist}>
              Modify Spotlists
            </div>
          ) : (
            <div className="add-favorite-btn-2" onClick={saveToSpotlist}>
              Save to spotlist
            </div>
          )}
        </div>
      </div>
      {addingNote && (
        <AddNote
          setAddingNote={setAddingNote}
          placeNote={placeNote}
          setPlaceNote={setPlaceNote}
          spotlistId={spotlistId}
          spotId={placeDetails._id}
        />
      )}
      {addingToSpotlist && (
        <AddToSpotlist
          setAddingToSpotlist={setAddingToSpotlist}
          setCreatingNewSpotlist={setCreatingNewSpotlist}
          spotId={placeDetails._id}
          setIsFavourite={setIsFavourite}
          setSpotlistId={setSpotlistId}
        />
      )}
      {creatingNewSpotlist && (
        <CreateNewSpotlist
          setCreatingNewSpotlist={setCreatingNewSpotlist}
          setIsFavourite={setIsFavourite}
          spotId={placeDetails._id}
          setSpotlistId={setSpotlistId}
        />
      )}
      {addingToSpotlist && <div className="spotlist-shade" />}
      {creatingNewSpotlist && <div className="spotlist-shade" />}
      {addingNote && <div className="spotlist-shade" />}
    </>
  );
}
