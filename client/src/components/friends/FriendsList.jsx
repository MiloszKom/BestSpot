import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function FriendsList() {
  useEffect(() => {
    const fetchFriends = async () => {
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
      }
    };
    fetchFriends();
  }, []);

  const [friends, setFriends] = useState([]);

  return (
    <div className="friends-body">
      <span className="friends-count">{friends.length} Friends</span>

      {friends.map((friend) => {
        return (
          <Link to={`/${friend.handle}`} className="friend-el" key={friend._id}>
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
  );
}
