import React from "react";
import { useQuery } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { getLatestSpots } from "../api/spotApis";
import { Link } from "react-router-dom";
import LoadingWave from "./LoadingWave";
import { formatTimeAgo } from "../utils/helperFunctions";

export default function SidePannel() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["latestSpots"],
    queryFn: getLatestSpots,
    refetchInterval: 10000,
  });

  const spots = data?.data;

  return (
    <div className="side-pannel-container">
      <div className="side-pannel-content">
        <div className="side-pannel-header">Recently added</div>
        {isLoading ? (
          <LoadingWave />
        ) : isError ? (
          <div className="general-error">
            {error.response?.data?.message || "An unexpected error occurred"}
          </div>
        ) : spots?.length > 0 ? (
          <div className="side-pannel-body">
            {spots?.map((spot) => {
              return (
                <Link
                  to={`/spot/${spot._id}`}
                  className="side-pannel-body-el"
                  key={spot._id}
                >
                  <div
                    className="photo"
                    style={{
                      backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.photo})`,
                    }}
                  />
                  <div className="info">
                    <div className="name no-wrap">{spot.name}</div>
                    <div className="location no-wrap">
                      <FontAwesomeIcon icon={faLocationDot} />{" "}
                      <span>
                        {spot.city}, {spot.country}
                      </span>
                    </div>
                    <div className="timestamp no-wrap">
                      Added: {formatTimeAgo(spot.createdAt)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="side-pannel-empty"> No spots have been added yet</div>
        )}
      </div>

      <div className="footer">&copy; 2025 BestSpot</div>
    </div>
  );
}
