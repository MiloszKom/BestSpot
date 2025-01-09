import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import ShowOptions from "../posts/ShowOptions";

// import { AlertContext } from "../context/AlertContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

import EditSpotlist from "./components/EditSpotlist";

import { getVisibilityDisplayName } from "./../utils/helperFunctions";

export default function Spotlists() {
  const [spotlists, setSpotlists] = useState([]);
  const [editingSpotlist, setEditingSpotlist] = useState(false);

  const [options, setOptions] = useState(null);

  const fetchSpotlists = async () => {
    try {
      const res = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists`,
        withCredentials: true,
      });

      console.log(res);
      setSpotlists(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSpotlists();
  }, []);

  return (
    <div className="spotlists">
      <div className="spotlists-header">Your Spotlists</div>
      <div className="spotlists-wrapper">
        {spotlists.map((spotlist) => {
          return (
            <Link
              to={`list/${spotlist._id}`}
              className="spotlists-el"
              key={spotlist._id}
            >
              <div
                className="spotlists-thumbnail"
                style={{
                  backgroundImage: `url(http://${
                    process.env.REACT_APP_SERVER
                  }:5000/uploads/images/${
                    spotlist.cover === "s" ? "no-img-found.jpg" : spotlist.cover
                  })`,
                }}
              >
                <span className="spotlists-spot-count">
                  {spotlist.spots.length} spots
                </span>
              </div>
              <div className="spotlists-info">
                <span className="spotlists-title">{spotlist.name}</span>
                <p className="spotlists-details">
                  {getVisibilityDisplayName(spotlist.visibility)}
                </p>
                <p className="spotlists-description">Description</p>
              </div>
              <div className="spotlists-menu">
                <button
                  onClick={() =>
                    setOptions({
                      spotlistId: spotlist._id,
                      aviableOptions: ["edit", "delete"],
                      entity: "spotlist",
                    })
                  }
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </button>
                {options && options.spotlistId === spotlist._id && (
                  <ShowOptions
                    options={options}
                    setOptions={setOptions}
                    setData={setSpotlists}
                    setEditingSpotlist={setEditingSpotlist}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}

      {editingSpotlist && (
        <EditSpotlist
          editingSpotlist={editingSpotlist}
          setEditingSpotlist={setEditingSpotlist}
        />
      )}
    </div>
  );
}
