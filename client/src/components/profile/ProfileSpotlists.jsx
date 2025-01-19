import React from "react";
import { useOutletContext } from "react-router-dom";

import { Spotlists } from "../spotlists/components/Spotlists";

export function ProfileSpotlists() {
  const { spotlists, setSpotlists, options, setOptions } = useOutletContext();

  return (
    <div className="profile-spotlists-wrapper">
      <div className="spotlists-wrapper">
        <Spotlists
          spotlists={spotlists}
          setSpotlists={setSpotlists}
          options={options}
          setOptions={setOptions}
        />
      </div>
    </div>
  );
}
