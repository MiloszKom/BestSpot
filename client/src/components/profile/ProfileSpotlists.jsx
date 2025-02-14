import React from "react";
import { useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProfileSpotlists } from "../api/profileApis";

import { Spotlists } from "../spotlists/components/Spotlists";
import LoadingWave from "../common/LoadingWave";

export function ProfileSpotlists() {
  const { user, userData, options, setOptions } = useOutletContext();

  const { data, isLoading } = useQuery({
    queryKey: ["userSpotlists", user.handle],
    queryFn: () => getProfileSpotlists(user.handle),
  });

  const spotlists = data?.data;

  if (isLoading) return <LoadingWave />;

  return (
    <div className="profile-spotlists-container">
      {spotlists.length > 0 ? (
        <div className="spotlists-wrapper">
          <Spotlists
            spotlists={spotlists}
            options={options}
            setOptions={setOptions}
          />
        </div>
      ) : (
        <div className="empty-profile-message">
          {userData?._id === user._id
            ? "Your profile currently doesn't have any spotlists. Consider creating some to share your favorite places with others."
            : `@${user.handle} hasn't shared any spotlists. Maybe they’re still exploring!`}
        </div>
      )}
    </div>
  );
}
