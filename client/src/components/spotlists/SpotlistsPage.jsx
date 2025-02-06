import React, { useState } from "react";
import axios from "axios";

import { Spotlists } from "./components/Spotlists";
import LoadingWave from "../common/LoadingWave";
import { useQuery } from "@tanstack/react-query";

export default function SpotlistsPage() {
  const [options, setOptions] = useState(null);

  const fetchSpotlists = async () => {
    const response = await axios.get(
      `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists`,
      { withCredentials: true }
    );
    return response.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["userSpotlists"],
    queryFn: fetchSpotlists,
  });

  const spotlists = data?.data;

  return (
    <div className="spotlists">
      <div className="spotlists-header">Spotlists</div>
      <div className="spotlists-body">
        {isLoading ? (
          <LoadingWave />
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
