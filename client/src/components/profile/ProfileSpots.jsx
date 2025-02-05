import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import axios from "axios";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import LoadingWave from "../common/LoadingWave";

export default function ProfileSpots() {
  const [spots, setSpots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userData } = useOutletContext();

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${user.handle}/spots`,
          withCredentials: true,
        });
        console.log(res);
        setSpots(res.data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchSpots();
  }, [user]);

  if (isLoading) return <LoadingWave />;

  return (
    <div className="profile-spots-container">
      {spots.length > 0 ? (
        spots.map((spot) => {
          return (
            <Link to={`/spot/${spot._id}`} className="spotlist-detail-spots-el">
              <div
                className="image"
                style={{
                  backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.photo})`,
                }}
              />
              <div className="info">
                <div className="name">{spot.name}</div>
                <div className="location">
                  <FontAwesomeIcon icon={faLocationDot} />
                  {spot.city}, {spot.country}
                </div>
              </div>
            </Link>
          );
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
