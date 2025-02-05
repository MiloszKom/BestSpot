import React, { useState, useContext, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  NavLink,
  useNavigate,
  useParams,
  Outlet,
} from "react-router-dom";
import axios from "axios";

import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faComment,
  faUserPlus,
  faGear,
  faBan,
  faUserMinus,
} from "@fortawesome/free-solid-svg-icons";

import { sendInvite, cancelInvite, unfriend } from "../utils/profileUtils";
import useScrollPosition from "../utils/useScrollPosition";

export default function Profile() {
  const [options, setOptions] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [inviteStatus, setInviteStatus] = useState(null);

  const containerRef = useRef();
  useScrollPosition(containerRef);

  const params = useParams();
  const navigate = useNavigate();

  const { userData } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);

  const fetchProfile = async () => {
    const response = await axios.get(
      `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${params.handle}`,
      { withCredentials: true }
    );
    return response.data;
  };

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", params.handle],
    queryFn: fetchProfile,
  });

  if (isProfileLoading) return <div className="loader" />;
  if (isProfileError) {
    return (
      <div>
        {profileError.response?.data?.message && (
          <span>{profileError.response.data.message}</span>
        )}
      </div>
    );
  }

  const user = profileData.data.viewedUser;

  return (
    <div className="profile-container" ref={containerRef}>
      <div className="profile-header">
        <div className="icon-wrapper" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>
        <span>{user.name}</span>
      </div>
      <div className="profile-info">
        <div
          className="image"
          style={{
            backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${user.photo})`,
          }}
        />
        <div className="name">{user.name}</div>
        <div className="handle">@{user.handle}</div>
      </div>
      <div className="profile-actions-wrapper">
        <div className="profile-actions">
          {userData._id === user._id ? (
            <Link to="/settings" className="action-el settings">
              <FontAwesomeIcon icon={faGear} />
              <span>Profile Settings</span>
            </Link>
          ) : (
            <>
              <Link
                to={`/messages/chat-room/${user._id}`}
                className="action-el message"
              >
                <FontAwesomeIcon icon={faComment} />
                <span>Send message</span>
              </Link>

              {loadingStatus ? (
                <div className="action-el friend">
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  {inviteStatus === "not-sent" && (
                    <div
                      className="action-el friend"
                      onClick={() =>
                        sendInvite({
                          setLoadingStatus,
                          setInviteStatus,
                          showAlert,
                          userId: user._id,
                        })
                      }
                    >
                      <FontAwesomeIcon icon={faUserPlus} />
                      <span>Add friends</span>
                    </div>
                  )}
                  {inviteStatus === "pending" && (
                    <div
                      className="action-el friend"
                      onClick={() =>
                        cancelInvite({
                          setLoadingStatus,
                          setInviteStatus,
                          showAlert,
                          userId: user._id,
                        })
                      }
                    >
                      <FontAwesomeIcon icon={faBan} />
                      <span>Cancel invite</span>
                    </div>
                  )}
                  {inviteStatus === "accepted" && (
                    <div
                      className="action-el friend"
                      onClick={() =>
                        unfriend({
                          setLoadingStatus,
                          setInviteStatus,
                          userId: user._id,
                        })
                      }
                    >
                      <FontAwesomeIcon icon={faUserMinus} />
                      <span>Unfriend</span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-content-header">
          <NavLink
            to=""
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Posts
          </NavLink>

          <NavLink
            to="spotlists"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Spotlists
          </NavLink>

          <NavLink
            to="spots"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Spots
          </NavLink>
        </div>
        <div className="profile-content-body">
          <Outlet
            context={{
              user,
              userData,
              options,
              setOptions,
            }}
          />
        </div>
      </div>
      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
