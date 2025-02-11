import React, { useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import ShowOptions from "../common/ShowOptions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faEllipsisVertical,
  faHeart as solidHeart,
} from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";
import { getVisibilityDisplayName } from "./../utils/helperFunctions";
import EditSpotlist from "./components/EditSpotlist";
import { useQuery } from "@tanstack/react-query";
import { getSpotsInSpotlist } from "../api/spotlistsApis";
import { useSpotlistsMutations } from "../hooks/useSpotlistsMutations";
import Spot from "../spot/Spot";

export default function SpotlistContent() {
  const [editingSpotlist, setEditingSpotlist] = useState(false);

  const [options, setOptions] = useState(null);
  const params = useParams();
  const navigate = useNavigate();

  const { userData } = useContext(AuthContext);

  const {
    deleteSpotFromSpotlistMutation,
    deleteSpotlistMutation,
    toggleSpotlistLikeMutation,
  } = useSpotlistsMutations();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["spotlistContent", params.id],
    queryFn: () => getSpotsInSpotlist(params.id),
  });

  const spotlistData = data?.data;

  if (isLoading) return <div className="loader big" />;

  const deleteSpotFromSpotlist = () => {
    deleteSpotFromSpotlistMutation.mutate({
      spotlistId: options.spotlistId,
      spotId: options.spotId,
    });
    setOptions(false);
  };

  const deleteSpotlist = () => {
    deleteSpotlistMutation.mutate({
      spotlistId: options.spotlistInfo.id,
      shouldNavigate: true,
    });
    setOptions(false);
  };

  if (isError)
    return (
      <div className="spotlist-detail-error">
        {error.response.data.message}{" "}
        <button onClick={() => navigate(-1)}> Return </button>
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
              {getVisibilityDisplayName(spotlistData.visibility)} ·{" "}
              {spotlistData.likeCount} Likes
            </span>
          </div>
          {spotlistData.description && (
            <div className="spotlist-detail-description">
              {spotlistData.description}
            </div>
          )}
        </div>
        <div className="spotlist-detail-options">
          <button
            className={`spotlist-detail-options-el ${
              spotlistData.isSpotlistLiked ? "active" : ""
            }`}
            onClick={() =>
              toggleSpotlistLikeMutation.mutate({
                isLiked: spotlistData.isSpotlistLiked,
                spotlistId: spotlistData._id,
              })
            }
          >
            <FontAwesomeIcon
              icon={spotlistData.isSpotlistLiked ? solidHeart : regularHeart}
            />
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
                      key: "spotlistContent",
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
                  deleteSpotlist={deleteSpotlist}
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
            <Spot
              key={spot._id}
              spot={spot}
              spotlistData={spotlistData}
              options={options}
              setOptions={setOptions}
              deleteSpotFromSpotlist={deleteSpotFromSpotlist}
            />
          );
        })}
      </div>
      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}

      {editingSpotlist && (
        <>
          <EditSpotlist
            editingSpotlist={editingSpotlist}
            setEditingSpotlist={setEditingSpotlist}
          />
          <div className="spotlist-shade"></div>
        </>
      )}
    </div>
  );
}
