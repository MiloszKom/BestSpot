import React, { useState } from "react";
import { Link } from "react-router-dom";
import LoadingWave from "../common/LoadingWave";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../api/friendsApis";
import { useFriendsMutations } from "../hooks/useFriendsMutations";
import Spinner from "../common/Spinner";

export default function FriendsRequests() {
  const { data, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const requests = data?.data.pendingRequests;

  const { acceptRequestMutation, deleteRequestMutation } =
    useFriendsMutations();

  const [pendingRequestId, setPendingRequestId] = useState(null);

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
            const isAccepting =
              pendingRequestId === request._id &&
              acceptRequestMutation.isPending;
            const isDeleting =
              pendingRequestId === request._id &&
              deleteRequestMutation.isPending;

            return (
              <Link
                to={`/${request.handle}`}
                className="friend-request-el"
                key={request._id}
              >
                <div
                  className="friend-request-el-img"
                  style={{
                    backgroundImage: `url(${request.photo})`,
                  }}
                />
                <div className="friend-request-el-info">
                  <p>{request.name}</p>
                  <p>@{request.handle}</p>
                </div>
                <div className="friend-request-el-options">
                  <button
                    className="accept"
                    onClick={(e) => {
                      e.preventDefault();
                      setPendingRequestId(request._id);
                      acceptRequestMutation.mutate(request._id, {
                        onSettled: () => setPendingRequestId(null),
                      });
                    }}
                    disabled={isAccepting || isDeleting}
                  >
                    {isAccepting ? <Spinner /> : "Accept"}
                  </button>
                  <button
                    className="delete"
                    onClick={(e) => {
                      e.preventDefault();
                      setPendingRequestId(request._id);
                      deleteRequestMutation.mutate(request._id, {
                        onSettled: () => setPendingRequestId(null),
                      });
                    }}
                    disabled={isAccepting || isDeleting}
                  >
                    {isDeleting ? <Spinner /> : "Delete"}
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="friends-container-empty">
          You have no new friend requests at the moment.
          <br /> Check back later to see who wants to connect!
        </div>
      )}
    </div>
  );
}
