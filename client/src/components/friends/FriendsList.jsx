import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import LoadingWave from "../common/LoadingWave";

export default function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      setIsLoading(true);
      try {
        const res = await axios({
          method: "GET",
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/friends`,
          withCredentials: true,
        });
        setFriends(res.data.data);
        console.log(res);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFriends();
  }, []);

  if (isLoading) return <LoadingWave />;

  return (
    <div className="friends-body">
      {isLoading ? (
        <LoadingWave />
      ) : friends.length > 0 ? (
        <div className="friends-body-content">
          <span className="friends-count">{friends.length} Friends</span>
          {friends.map((friend) => {
            return (
              <Link
                to={`/${friend.handle}`}
                className="friend-el"
                key={friend._id}
              >
                <div
                  className="friend-el-img"
                  style={{
                    backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${friend.photo})`,
                  }}
                >
                  <div
                    className="friend-el-status"
                    style={{
                      backgroundColor: friend.isOnline ? "green" : "gray",
                    }}
                  />
                </div>
                <div className="friend-el-info">
                  <p>{friend.name}</p>
                  <p>@{friend.handle}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="friends-container-empty">
          Your friend list is empty. Start connecting with others to see them
          here!
        </div>
      )}
    </div>
  );
}
