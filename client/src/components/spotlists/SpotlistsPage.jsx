import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserSpotlists } from "../api/spotlistsApis";

import { Spotlists } from "./components/Spotlists";
import LoadingWave from "../common/LoadingWave";

export default function SpotlistsPage() {
  const [options, setOptions] = useState(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userSpotlists"],
    queryFn: getUserSpotlists,
  });

  const spotlists = data?.data || [];

  return (
    <div className="spotlists">
      <div className="spotlists-header">Your Spotlists</div>
      <div className="spotlists-body">
        {isLoading ? (
          <LoadingWave />
        ) : isError ? (
          <div className="general-error">
            {error.response?.data?.message || "An unexpected error occurred"}
          </div>
        ) : spotlists.length > 0 ? (
          <div className="spotlists-wrapper">
            <Spotlists
              spotlists={spotlists}
              options={options}
              setOptions={setOptions}
            />
          </div>
        ) : (
          <div className="empty-spotlists-message">
            No spotlists yet. Start saving your favorite spots!
          </div>
        )}
      </div>

      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
