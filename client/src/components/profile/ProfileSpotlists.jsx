import React from "react";
import { useOutletContext } from "react-router-dom";

import { SpotlistsElements } from "../favourites/components/SpotlistsElements";

export function ProfileSpotlists() {
  const { spotlists, setSpotlists, options, setOptions } = useOutletContext();

  return (
    <div className="profile-spotlists-wrapper">
      <div className="spotlists-wrapper">
        <SpotlistsElements
          spotlists={spotlists}
          setSpotlists={setSpotlists}
          options={options}
          setOptions={setOptions}
        />
      </div>
    </div>
  );
}
