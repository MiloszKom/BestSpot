import React, { useState, useEffect } from "react";
import axios from "axios";

import { Spotlists } from "./components/Spotlists";

export default function SpotlistsPage() {
  const [spotlists, setSpotlists] = useState([]);

  const [options, setOptions] = useState(null);

  const fetchSpotlists = async () => {
    try {
      const res = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists`,
        withCredentials: true,
      });

      console.log(res);
      setSpotlists(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSpotlists();
  }, []);

  return (
    <div className="spotlists">
      <div className="spotlists-header">Your Spotlists</div>
      <div className="spotlists-wrapper">
        <Spotlists
          spotlists={spotlists}
          setSpotlists={setSpotlists}
          options={options}
          setOptions={setOptions}
        />
      </div>

      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
