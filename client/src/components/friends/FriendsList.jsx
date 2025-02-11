import React from "react";
import { Link } from "react-router-dom";
import LoadingWave from "../common/LoadingWave";
import { useQuery } from "@tanstack/react-query";
import { getFriends } from "../api/friendsApis";

export default function FriendsList() {
  const { data, isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const friends = data?.data;

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
