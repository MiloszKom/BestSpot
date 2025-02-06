import axios from "axios";
import React, { useState, useEffect } from "react";
import LoadingWave from "../common/LoadingWave";

export default function FriendsRequests() {
  const [requests, setRequests] = useState([]);
  const [requestsResponses, setRequestResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios({
          method: "GET",
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/friends/requests`,
          withCredentials: true,
        });
        setRequests(res.data.data.pendingRequests);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const acceptRequest = async (userId) => {
    try {
      await axios({
        method: "POST",
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/acceptFriendRequest/${userId}`,
        withCredentials: true,
      });
      setRequestResponses((prevResponses) => [
        ...prevResponses,
        { _id: userId, message: "Request accepted" },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteRequest = async (userId) => {
    try {
      await axios({
        method: "DELETE",
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/rejectFriendRequest/${userId}`,
        withCredentials: true,
      });

      setRequestResponses((prevResponses) => [
        ...prevResponses,
        { _id: userId, message: "Request deleted" },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

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
            const requestResponseObject = requestsResponses.find(
              (response) => response._id === request._id
            );

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

                {requestResponseObject ? (
                  <div className="friend-request-el-response">
                    {requestResponseObject.message}
                  </div>
                ) : (
                  <div className="friend-request-el-options">
                    <button
                      className="accept"
                      onClick={() => acceptRequest(request._id)}
                    >
                      Accept
                    </button>
                    <button
                      className="delete"
                      onClick={() => deleteRequest(request._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
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
