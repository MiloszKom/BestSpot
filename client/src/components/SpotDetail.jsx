import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
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
} from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-regular-svg-icons";

import { starRating } from "./helperFunctions";

export default function SpotDetail({ setShowNavbar }) {
  const [imageError, setImageError] = useState(false);
  const [imgMargin, setImgMargin] = useState(0);

  const [showHours, setShowHours] = useState(false);

  const [placeDetails, setPlaceDetails] = useState(null);
  const [selectedOption, setSelectedOption] = useState("Public");
  const [placeNote, setPlaceNote] = useState("");

  const [justFetched, setJustFetched] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  const auth = useContext(AuthContext);
  const params = useParams();

  console.log(placeDetails);

  useEffect(() => {
    setShowNavbar(false);
    return () => {
      setShowNavbar(true);
    };
  }, [setShowNavbar]);

  useEffect(() => {
    const fetchFromDatabase = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/favourites/${params.id}`,
          withCredentials: true,
        });

        if (res.data.data.fav) {
          setPlaceDetails(res.data.data.fav);
          setIsFavourite(true);
          setJustFetched(false);
        } else {
          console.log(
            "No data found in the database, proceeding with API fetch."
          );
          fetchFromApi();
        }
      } catch (err) {
        console.log("Error fetching from the database:", err);
        fetchFromApi();
      }
    };

    const fetchFromApi = async () => {
      try {
        const res = await axios({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          url: "/api/v1/maps/getPlaceDetails",
          data: { id: params.id },
          withCredentials: true,
        });

        const placeData = res.data.googleData.result;

        placeData.geometry = placeData.geometry.location;
        placeData._id = placeData.place_id;
        console.log("Place Data:", placeData);
        setPlaceDetails(placeData);
        setJustFetched(true);

        const photos = placeData.photos || [];
        if (photos.length === 0) {
          return;
        }

        const fetchPhotoPromises = photos.slice(0, 3).map((photo) => {
          const photoData = {
            maxwidth: photo.width,
            photo_reference: photo.photo_reference,
          };

          return axios({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            url: "/api/v1/maps/getPlacePhotos",
            data: photoData,
            responseType: "blob",
          })
            .then((response) => {
              const imageUrl = URL.createObjectURL(response.data);
              return imageUrl;
            })
            .catch((err) => {
              console.log("Error fetching photo:", err);
              return null;
            });
        });

        const photoUrls = await Promise.all(fetchPhotoPromises);

        setPlaceDetails((prev) => ({
          ...prev,
          photos: photoUrls.filter((url) => url !== null),
        }));
      } catch (err) {
        console.log("Error fetching place data or photos:", err);
      }
    };

    fetchFromDatabase();
  }, []);

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

  const handleClick = () => {
    setShowHours(!showHours);
  };

  function formatTime(time) {
    const hours = time.slice(0, 2);
    const minutes = time.slice(2);
    return `${hours}:${minutes}`;
  }

  const getNearestTime = () => {
    let periods = placeDetails.current_opening_hours.periods;
    if (!periods) return;

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    if (!periods[currentDay]) {
      const currentOpeningHours =
        placeDetails?.current_opening_hours?.weekday_text;

      if (currentOpeningHours && currentOpeningHours[currentDay - 1]) {
        const openingHoursText =
          currentOpeningHours[currentDay - 1].split(": ")[1];

        if (openingHoursText === "Open 24 hours") {
          return <span className="map-result-open">Open 24 hours</span>;
        }
      }

      return (
        <>
          <span className="map-result-closed">Closed </span>
          <span>&middot; Not Operating Today</span>
        </>
      );
    }

    const todayHours = periods[currentDay];

    if (currentTime < todayHours.open.time) {
      return (
        <>
          <span className="map-result-closed">Closed</span>
          &nbsp;·&nbsp;Opens {formatTime(todayHours.open.time)}
        </>
      );
    } else if (currentTime < todayHours.close.time) {
      return (
        <>
          <span className="map-result-open">Open</span>
          &nbsp;·&nbsp;Closes {formatTime(todayHours.close.time)}
        </>
      );
    } else {
      return <span className="map-result-closed">Closed</span>;
    }
  };

  const blobToFile = (theBlob, fileName) => {
    theBlob.lastModifiedDate = new Date();
    theBlob.name = fileName;
    return theBlob;
  };

  const urlToBlob = async (imageUrl) => {
    console.log("Processed url :", imageUrl);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image. Status: ${response.status}`);
      }
      const blob = await response.blob();
      console.log(`Blob created with type: ${blob.type}`);
      return blob;
    } catch (error) {
      console.error("Error converting image URL to Blob:", error);
      return null;
    }
  };

  const addToFavourites = async () => {
    try {
      const formData = new FormData();

      if (placeDetails.photos && placeDetails.photos.length > 0) {
        const photoPromises = placeDetails.photos.map(async (photoUrl, i) => {
          let blob;

          if (photoUrl.endsWith(".jpeg")) {
            blob = await urlToBlob(
              `http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${placeDetails.photos[i]}`
            );
          } else {
            const response = await fetch(photoUrl);
            blob = await response.blob();
          }

          if (blob) {
            const file = blobToFile(blob, `image-${i + 1}.jpg`);
            console.log("appending photo for some reason");
            formData.append("photo", file);
          } else {
            console.error(`Failed to create blob for photo: ${photoUrl}`);
          }
        });

        await Promise.all(photoPromises);
      }

      formData.append("_id", placeDetails._id);
      formData.append("user_id", auth.userData._id);
      formData.append("name", placeDetails.name);
      formData.append("rating", placeDetails.rating);
      formData.append("user_ratings_total", placeDetails.user_ratings_total);
      formData.append("vicinity", placeDetails.vicinity);
      formData.append(
        "current_opening_hours",
        JSON.stringify(placeDetails.current_opening_hours)
      );
      if (placeDetails.website)
        formData.append("website", placeDetails.website);
      if (placeDetails.international_phone_number)
        formData.append(
          "international_phone_number",
          placeDetails.international_phone_number
        );
      formData.append("reviews", JSON.stringify(placeDetails.reviews));
      formData.append("url", placeDetails.url);
      formData.append("geometry", JSON.stringify(placeDetails.geometry));
      formData.append("userNote", placeNote);
      formData.append("privacyOptions", selectedOption);

      console.log([...formData.entries()]);

      const res = await axios.post(
        `http://${process.env.REACT_APP_SERVER}:5000/api/v1/favourites`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Success:", res.data);
      hideNote();
      setIsFavourite(true);
    } catch (err) {
      console.error(
        "Error adding to favourites:",
        err.response ? err.response.data : err.message
      );
    }
  };

  const removeFromFavourites = async () => {
    try {
      const res = await axios.delete(
        `http://${process.env.REACT_APP_SERVER}:5000/api/v1/favourites/${placeDetails._id}`,
        {
          withCredentials: true,
        }
      );
      if (res.status === 204) {
        setIsFavourite(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addNote = () => {
    const spotDetail = document.querySelector(".spot-detail");
    spotDetail.style.opacity = ".4";
    spotDetail.style.overflowY = "hidden";

    const popup = document.querySelector(".popup-container");
    popup.style.transform = "translate(-50%, -50%)"; // Removed semicolon inside the string
    popup.style.opacity = "1";
    popup.style.pointerEvents = "all";
  };

  const hideNote = () => {
    const spotDetail = document.querySelector(".spot-detail");
    spotDetail.style.opacity = "1";
    spotDetail.style.overflowY = "auto";

    const popup = document.querySelector(".popup-container");
    popup.style.transform = "translate(-50%, -20%)"; // Removed semicolon inside the string
    popup.style.opacity = "0";
    popup.style.pointerEvents = "none";
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  if (!placeDetails) return <div>loading...</div>;

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
            <div className="spot-detail-info-el" onClick={handleClick}>
              <div className="icon">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <p>
                {!showHours && <>{getNearestTime()}</>}
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
          {placeDetails.userNote && (
            <div className="spot-detail-info-el">
              <div className="icon icon-pink">
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <p>{placeDetails.userNote}</p>
            </div>
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
