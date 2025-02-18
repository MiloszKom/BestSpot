import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import { getVisibilityIcon } from "../../utils/helperFunctions";
import { useQuery } from "@tanstack/react-query";
import { getUserSpotlists } from "../../api/spotlistsApis";
import LoadingWave from "../../common/LoadingWave";
import Spinner from "../../common/Spinner";

import { useSpotMutations } from "../../hooks/useSpotMutations";

export default function AddToSpotlist({
  setAddingToSpotlist,
  setCreatingNewSpotlist,
  spotId,
}) {
  const [spotlistsChecked, setSpotlistsChecked] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ["addToSpotlist"],
    queryFn: getUserSpotlists,
  });

  const spotlists = data?.data;

  useEffect(() => {
    if (data) {
      const initializedSpotlistsChecked = data?.data.map((spotlist) => ({
        id: spotlist._id,
        isChanged: false,
        isChecked: spotlist.spots.includes(spotId),
      }));

      setSpotlistsChecked(initializedSpotlistsChecked);
    }
  }, [data, spotId]);

  const handleCheckboxChange = (id) => {
    setSpotlistsChecked((prevSelected) => {
      const existingSpotlist = prevSelected.find((item) => item.id === id);

      if (existingSpotlist) {
        return prevSelected.map((item) =>
          item.id === id
            ? {
                ...item,
                isChanged: !item.isChanged,
                isChecked: !item.isChecked,
              }
            : item
        );
      } else {
        return [...prevSelected, { id, isChanged: true, isChecked: true }];
      }
    });
  };

  const { manageSpotlistsMutation } = useSpotMutations();

  const manageSpotlists = async () => {
    let spotlistsAdded = [];
    let spotlistsRemoved = [];

    spotlistsChecked.forEach((spotlist) => {
      if (spotlist.isChanged) {
        if (spotlist.isChecked) {
          spotlistsAdded.push(spotlist.id);
        } else {
          spotlistsRemoved.push(spotlist.id);
        }
      }
    });

    const data = {
      spotId: spotId,
      spotlistsAdded,
      spotlistsRemoved,
    };

    manageSpotlistsMutation.mutate(data, {
      onSettled: () => {
        setAddingToSpotlist(false);
      },
    });
  };

  const isSpotlistChecked = (id) => {
    return spotlistsChecked.some((item) => item.id === id && item.isChecked);
  };

  return (
    <div className="spotlist-add-container">
      <div className="spotlist-add-header">
        Save to spotlist
        <button
          className="close-button"
          onClick={() => setAddingToSpotlist(false)}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
      <div className="spotlist-add-list">
        {isLoading ? (
          <LoadingWave />
        ) : spotlists.length > 0 ? (
          spotlists.map((spotlist) => (
            <div className="spotlist-add-list-item" key={spotlist._id}>
              <input
                className="spotlist-add-checkbox"
                type="checkbox"
                id={spotlist._id}
                checked={isSpotlistChecked(spotlist._id)}
                onChange={() => handleCheckboxChange(spotlist._id)}
              />
              <label htmlFor={spotlist._id}>{spotlist.name}</label>
              <span className="spotlist-icon">
                <FontAwesomeIcon
                  icon={getVisibilityIcon(spotlist.visibility)}
                />
              </span>
            </div>
          ))
        ) : (
          <div className="spotlist-add-empty">
            No spotlists found! Create your first spotlist to organize and save
            your spots
          </div>
        )}
      </div>
      <button
        className="spotlist-btn spotlist-add-new-btn"
        onClick={() => {
          setAddingToSpotlist(false);
          setCreatingNewSpotlist(true);
        }}
      >
        Create Spotlist
      </button>
      <button
        className={`spotlist-btn spotlist-add-to-btn ${
          !spotlistsChecked.some((item) => item.isChanged) > 0 ||
          manageSpotlistsMutation.isPending
            ? "disabled"
            : ""
        }`}
        disabled={
          !spotlistsChecked.some((item) => item.isChanged) > 0 ||
          manageSpotlistsMutation.isPending
        }
        onClick={manageSpotlists}
      >
        {manageSpotlistsMutation.isPending ? <Spinner /> : "Save"}
      </button>
    </div>
  );
}
