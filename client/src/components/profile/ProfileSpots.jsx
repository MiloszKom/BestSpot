import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingWave from "../common/LoadingWave";
import { useQuery } from "@tanstack/react-query";
import { getProfileSpots } from "../api/profileApis";

export default function ProfileSpots() {
  const { user, userData } = useOutletContext();

  const { data, isLoading } = useQuery({
    queryKey: ["userSpots", user.handle],
    queryFn: () => getProfileSpots(user.handle),
  });

  const spots = data?.data;

  if (isLoading) return <LoadingWave />;

  return (
    <div className="profile-spots-container">
      {spots.length > 0 ? (
        spots.map((spot) => {
          return (
            <Link
              to={`/spot/${spot._id}`}
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
            </Link>
          );
        })
      ) : (
        <div className="empty-profile-message">
          {userData._id === user._id
            ? "No spots have been added yet. Start adding your favorite places to share with the community!"
            : `No spots have been added by @${user.handle} yet`}
        </div>
      )}
    </div>
  );
}
