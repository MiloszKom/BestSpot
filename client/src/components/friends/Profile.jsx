import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [inviteStatus, setInviteStatus] = useState("not_sent");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const auth = useContext(AuthContext);

  useEffect(() => {
    if (!profileData) return;

    profileData.friends.forEach((el) => {
      if (el._id === auth.userData._id) {
        setInviteStatus("accepted");
      }
    });

    profileData.pendingRequests.forEach((el) => {
      if (el._id === auth.userData._id) {
        setInviteStatus("pending");
      }
    });
  }, [profileData]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${params.id}`,
          withCredentials: true,
        });

        setProfileData(res.data.data.user);
      } catch (err) {
        console.log(err);
      }
    };
    getUser();
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  const sendInvite = async () => {
    setIsLoading(true);
    try {
      const res = await axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/sendFriendRequest/${params.id}`,
        withCredentials: true,
      });
      setInviteStatus("pending");
      console.log(res);
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  const cancelInvite = async () => {
    setIsLoading(true);
    try {
      const res = await axios({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/cancelFriendRequest/${params.id}`,
        withCredentials: true,
      });
      setInviteStatus("not_sent");
      console.log(res);
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  const unfriend = async () => {
    setIsLoading(true);
    try {
      const res = await axios({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/deleteFriend/${params.id}`,
        withCredentials: true,
      });
      console.log(res);
      setInviteStatus("not_sent");
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false);
  };

  return (
    <>
      {!profileData ? (
        <div className="loader"></div>
      ) : (
        <div className="messages-container">
          <div className="profile-header">
            <FontAwesomeIcon icon={faArrowLeft} onClick={handleGoBack} />
          </div>
          <div className="profile-details">
            <div
              className="profile-img"
              style={{
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${profileData.photo})`,
              }}
            ></div>
            <div className="profile-name">{profileData.name}</div>
            <div className="profile-options">
              {isLoading ? (
                <div>Loading...</div>
              ) : (
                <>
                  {inviteStatus === "not_sent" && (
                    <div onClick={sendInvite}>Add to friends</div>
                  )}
                  {inviteStatus === "pending" && (
                    <div onClick={cancelInvite}>Cancel invite</div>
                  )}
                  {inviteStatus === "accepted" && (
                    <div onClick={unfriend}>Unfriend</div>
                  )}
                </>
              )}
              <div>
                <Link to={`/messages/chat-room/${profileData._id}`}>
                  Message
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
