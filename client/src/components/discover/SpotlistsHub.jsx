import axios from "axios";
import React, { useEffect, useState } from "react";

import { Spotlists } from "../spotlists/components/Spotlists";

export default function SpotlistsHub() {
  const [order, setOrder] = useState("newest");
  const [spotlists, setSpotlists] = useState([]);
  const [options, setOptions] = useState(false);

  useEffect(() => {
    const fetchSpotlists = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/discover?order=${order}`,
          withCredentials: true,
        });
        console.log(res);
        setSpotlists(res.data.data.spotlists);
      } catch (err) {
        console.log(err);
      }
    };

    fetchSpotlists();
  }, [order]);

  return (
    <div className="spotlists-hub-container">
      <div className="spotlists-hub-header">Spotlists Hub</div>
      <div className="spotlists-hub-sort-options">
        <button
          className={`sort-option ${order === "newest" ? "active" : ""}`}
          onClick={() => setOrder("newest")}
        >
          Newest
        </button>
        <button
          className={`sort-option ${order === "popular" ? "active" : ""}`}
          onClick={() => setOrder("popular")}
        >
          Popular
        </button>
      </div>
      <div className="spotlists-hub-body">
        <div className="spotlists-wrapper">
          <Spotlists
            spotlists={spotlists}
            setSpotlists={setSpotlists}
            options={options}
            setOptions={setOptions}
          />
        </div>
      </div>
      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
