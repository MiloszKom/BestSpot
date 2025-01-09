import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faClone,
  faEllipsisVertical,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";

import { getVisibilityDisplayName } from "./../utils/helperFunctions";

export default function SpotlistContent() {
  const [spotlistData, setSpotlistData] = useState([]);

  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${params.id}`,
          withCredentials: true,
        });

        console.log(res.data.data);
        setSpotlistData(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFavourites();
  }, []);

  return (
    <div className="spotlist-detail-container">
      <div className="spotlist-detail-header">
        <div className="svg-wrapper" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeftLong} />
        </div>
        <div
          className="spotlist-detail-header-cover"
          style={{
            backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spotlistData.cover})`,
          }}
        />
        <div className="spotlist-detail-info">
          <div className="spotlist-detail-title">{spotlistData.name}</div>
          <div className="spotlist-detail-author">
            <div
              className="image"
              style={{
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/user-66f8f55210af8d3b128954d0-1735126269284-1.jpeg)`,
              }}
            />
            <span>XoNi</span>
          </div>
          <div className="spot-detail-details">
            <span>
              {spotlistData.spots?.length} Spots ·{" "}
              {getVisibilityDisplayName(spotlistData.visibility)} · 0 Likes · 0
              Views
            </span>
          </div>
          <div className="spotlist-detail-description">Description</div>
        </div>
        <div className="spotlist-detail-options">
          <button className="option">
            <FontAwesomeIcon icon={faHeart} />
          </button>
          <button className="option">
            <FontAwesomeIcon icon={faClone} />
          </button>
          <button className="option options">
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
        </div>
      </div>
      <div className="spotlist-detail-spots">
        {spotlistData.spots?.map((spot) => {
          return (
            <Link
              to={`/spot/${spot.google_id}`}
              className="spotlist-detail-spots-el"
              key={spot._id}
            >
              <div
                className="image"
                style={{
                  backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.photo})`,
                }}
              />
              <div className="info">
                <div className="name">{spot.name}</div>
                <div className="location">
                  <FontAwesomeIcon icon={faLocationDot} />
                  {spot.city}, {spot.country}
                </div>
              </div>
              <button className="options">
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
