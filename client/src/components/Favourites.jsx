import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export default function Favourites() {
  const [favourites, setFavourites] = useState(null);

  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/favourites`,
          withCredentials: true,
        });

        console.log(res.data.data.favs);
        setFavourites(res.data.data.favs);
      } catch (err) {
        console.log(err);
      }
    };

    fetchFavourites();
  }, []);

  const coverPhoto = (favourite) => {
    if (favourite.photos && favourite.photos.length > 0) {
      return favourite.photos[0];
    }
    return "no-img-found.jpg";
  };

  return (
    <div className="favourites">
      <h1 className="fav-title">Your favourites</h1>
      {!auth.isLoggedIn && (
        <div className="favourites-container">
          <h2>Log in to see your favourite places</h2>
          <p>Favourites can be added, deleted and shared after logging in</p>
          <Link to="/login" className="button">
            Log in
          </Link>
        </div>
      )}
      {auth.isLoggedIn && (
        <div className="favourites-container-2">
          {favourites ? (
            favourites.map((favourite) => (
              <Link
                to={favourite._id}
                className="fav-el"
                key={favourite._id}
                style={{
                  backgroundImage: `url(http://${
                    process.env.REACT_APP_SERVER
                  }:5000/uploads/images/${coverPhoto(favourite)})`,
                }}
              >
                <div className="fav-el-info">
                  <div className="fav-el-info-name">{favourite.name}</div>
                  <div className="fav-el-info-details">
                    {favourite.rating} ({favourite.user_ratings_total})
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div>loading...</div>
          )}
        </div>
      )}
    </div>
  );
}
