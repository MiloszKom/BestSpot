import React from "react";
import LoadingWave from "../common/LoadingWave";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../api/friendsApis";
import { useFriendsMutations } from "../hooks/useFriendsMutations";

export default function FriendsRequests() {
  const { data, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const requests = data?.data.pendingRequests;

  const { acceptRequestMutation, deleteRequestMutation } =
    useFriendsMutations();

  return (
    <div className="friends-body">
      {isLoading ? (
        <LoadingWave />
      ) : requests.length > 0 ? (
        <div className="friends-body-content">
          <span className="friends-count">
            Friend Requests ({requests.length})
          </span>
          {requests.map((request) => {
            return (
              <div className="friend-request-el" key={request._id}>
                <div
                  className="friend-request-el-img"
                  style={{
                    backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${request.photo})`,
                  }}
                />
                <div className="friend-request-el-info">
                  <p>{request.name}</p>
                  <p>@{request.handle}</p>
                </div>
                <div className="friend-request-el-options">
                  <button
                    className="accept"
                    onClick={() => acceptRequestMutation.mutate(request._id)}
                  >
                    Accept
                  </button>
                  <button
                    className="delete"
                    onClick={() => deleteRequestMutation.mutate(request._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="friends-container-empty">
          You have no new friend requests at the moment. Check back later to see
          who wants to connect!
        </div>
      )}
    </div>
  );
}
