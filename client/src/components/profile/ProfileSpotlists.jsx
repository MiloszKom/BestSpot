import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";

import { Spotlists } from "../spotlists/components/Spotlists";
import axios from "axios";
import LoadingWave from "../common/LoadingWave";

export function ProfileSpotlists() {
  const [spotlists, setSpotlists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userData, options, setOptions } = useOutletContext();

  useEffect(() => {
    const fetchProfileSpotlits = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${user.handle}/spotlists`,
          withCredentials: true,
        });
        setSpotlists(res.data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchProfileSpotlits();
  }, [user]);

  if (isLoading) return <LoadingWave />;

  return (
    <div className="profile-spotlists-container">
      {spotlists.length > 0 ? (
        <div className="spotlists-wrapper">
          <Spotlists
            spotlists={spotlists}
            setSpotlists={setSpotlists}
            options={options}
            setOptions={setOptions}
          />
        </div>
      ) : (
        <div className="empty-profile-message">
          {userData._id === user._id
            ? "Your profile currently doesn't have any spotlists. Consider creating some to share your favorite places with others."
            : `@${user.handle} hasn't shared any spotlists. Maybe they’re still exploring!`}
        </div>
      )}
    </div>
  );
}
