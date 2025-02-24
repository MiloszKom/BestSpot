import React from "react";
import { Link } from "react-router-dom";
import LoadingWave from "../common/LoadingWave";
import { useQuery } from "@tanstack/react-query";
import { getFriends } from "../api/friendsApis";

export default function FriendsList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const friends = data?.data;

  if (isLoading) return <LoadingWave />;

  return (
    <div className="friends-body">
      {isLoading ? (
        <LoadingWave />
      ) : isError ? (
        <div className="general-error">
          {error.response?.data?.message || "An unexpected error occurred"}
        </div>
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
                    backgroundImage: `url(${friend.photo})`,
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
          Your friend list is empty.
          <br /> Start connecting with others to see them here!
        </div>
      )}
    </div>
  );
}
