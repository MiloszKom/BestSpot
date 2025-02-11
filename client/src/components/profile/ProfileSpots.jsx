import React from "react";
import { useOutletContext } from "react-router-dom";
import LoadingWave from "../common/LoadingWave";
import { useQuery } from "@tanstack/react-query";
import { getProfileSpots } from "../api/profileApis";
import Spot from "../spot/Spot";

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
          return <Spot key={spot._id} spot={spot} />;
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
