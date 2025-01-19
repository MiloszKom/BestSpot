import React, { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";

import ShowOptions from "../posts/ShowOptions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faClone,
  faEllipsisVertical,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { getVisibilityDisplayName } from "./../utils/helperFunctions";
import EditSpotlist from "./components/EditSpotlist";

export default function SpotlistContent() {
  const [spotlistData, setSpotlistData] = useState(null);
  const [editingSpotlist, setEditingSpotlist] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [options, setOptions] = useState(null);

  const params = useParams();
  const navigate = useNavigate();

  const { userData } = useContext(AuthContext);

  useEffect(() => {
    const fetchFavourites = async () => {
      setIsLoading(true);
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${params.id}`,
          withCredentials: true,
        });

        setSpotlistData(res.data.data);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setErrorMessage(err.response.data.message);
        setIsLoading(false);
      }
    };

    fetchFavourites();
  }, []);

  if (!spotlistData && isLoading) return <div className="loader" />;
  if (!spotlistData && !isLoading)
    return (
      <div className="spotlist-detail-error">
        {errorMessage} <button onClick={() => navigate(-1)}> Return </button>
      </div>
    );

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
          <Link
            to={`/${spotlistData.author?.handle}`}
            className="spotlist-detail-author"
          >
            <div
              className="image"
              style={{
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spotlistData.author?.photo})`,
              }}
            />
            <span>{spotlistData.author?.name}</span>
          </Link>
          <div className="spot-detail-details">
            <span>
              {spotlistData.spots?.length} Spots ·{" "}
              {getVisibilityDisplayName(spotlistData.visibility)} · 0 Likes · 0
              Views
            </span>
          </div>
          {spotlistData.description && (
            <div className="spotlist-detail-description">
              {spotlistData.description}
            </div>
          )}
        </div>
        <div className="spotlist-detail-options">
          <button className="spotlist-detail-options-el">
            <FontAwesomeIcon icon={faHeart} />
          </button>
          <button className="spotlist-detail-options-el">
            <FontAwesomeIcon icon={faClone} />
          </button>
          {userData?._id === spotlistData.author?._id && (
            <div className="spotlist-detail-menu">
              <button
                onClick={() =>
                  setOptions({
                    spotlistInfo: {
                      id: spotlistData._id,
                      name: spotlistData.name,
                      visibility: spotlistData.visibility,
                      description: spotlistData.description,
                      context: "spotlistContent",
                    },
                    aviableOptions: ["edit", "delete"],
                    entity: "spotlist",
                  })
                }
              >
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
              {options && options.spotlistInfo?.id === spotlistData._id && (
                <ShowOptions
                  options={options}
                  setOptions={setOptions}
                  setData={setSpotlistData}
                  setEditingSpotlist={setEditingSpotlist}
                />
              )}
            </div>
          )}
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
              {userData._id === spotlistData.author._id && (
                <div className="menu" onClick={(e) => e.preventDefault()}>
                  <button
                    className="options"
                    onClick={() =>
                      setOptions({
                        spotlistId: spotlistData._id,
                        spotId: spot._id,
                        aviableOptions: ["delete"],
                        entity: "spot",
                      })
                    }
                  >
                    <FontAwesomeIcon icon={faEllipsisVertical} />
                  </button>
                  {options?.spotId === spot._id && (
                    <ShowOptions
                      options={options}
                      setOptions={setOptions}
                      setData={setSpotlistData}
                    />
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}

      {editingSpotlist && (
        <>
          <EditSpotlist
            setData={setSpotlistData}
            editingSpotlist={editingSpotlist}
            setEditingSpotlist={setEditingSpotlist}
          />
          <div className="spotlist-shade"></div>
        </>
      )}
    </div>
  );
}
