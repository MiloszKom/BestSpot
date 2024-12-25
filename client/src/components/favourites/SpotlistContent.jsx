import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

export default function SpotlistContent() {
  const [spots, setSpots] = useState([]);
  const spotlistId = localStorage.getItem("spotlistId");
  const spotlistName = localStorage.getItem("spotlistName");

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spotlists/${spotlistId}`,
          withCredentials: true,
        });

        console.log(res.data.data.spots);
        setSpots(res.data.data.spots);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFavourites();
  }, []);

  return (
    <div className="favourites">
      <h1 className="fav-title">Spotlist: {spotlistName}</h1>
      <div className="favourites-container-2">
        {spots.length > 0 ? (
          spots.map((spot) => (
            <Link
              to={spot.google_id}
              className="fav-el"
              key={spot._id}
              style={{
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.photo})`,
              }}
            >
              <div className="fav-el-info">
                <div className="fav-el-info-name">{spot.name}</div>
                <div className="fav-el-info-details">
                  {spot.rating} ({spot.user_ratings_total})
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>No spots found.</p> // Fallback message if no spots
        )}
      </div>
    </div>
  );
}
