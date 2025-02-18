import React, { useState, useContext, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Link,
  NavLink,
  useNavigate,
  useParams,
  Outlet,
} from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faComment,
  faUserPlus,
  faGear,
  faBan,
  faUserMinus,
} from "@fortawesome/free-solid-svg-icons";

import { FriendActionButton } from "./components/FriendActionButton";

import useScrollPosition from "../hooks/useScrollPosition";
import { getProfile } from "../api/profileApis";
import { useProfileMutations } from "../hooks/useProfileMutations";
import ErrorPage from "../pages/ErrorPage";

export default function Profile() {
  const [options, setOptions] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  const { userData } = useContext(AuthContext);

  const containerRef = useRef();
  useScrollPosition(containerRef, `scrolledHeight${params.handle}`);
  const { sendInviteMutation, cancelInviteMutation, unfriendMutation } =
    useProfileMutations();

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    isFetching,
  } = useQuery({
    queryKey: ["profile", params.handle],
    queryFn: () => getProfile(params.handle),
  });

  if (isProfileLoading) return <div className="loader" />;
  if (isProfileError) return <ErrorPage error={profileError} />;

  const user = profileData.data.viewedUser;
  const inviteStatus = profileData.data.inviteStatus;

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
          {userData?._id === user._id ? (
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

              {inviteStatus === "not-sent" && (
                <FriendActionButton
                  icon={faUserPlus}
                  label="Add friends"
                  mutation={sendInviteMutation}
                  userId={user._id}
                  isFetching={isFetching}
                />
              )}
              {inviteStatus === "pending" && (
                <FriendActionButton
                  icon={faBan}
                  label="Cancel invite"
                  mutation={cancelInviteMutation}
                  userId={user._id}
                  isFetching={isFetching}
                />
              )}
              {inviteStatus === "accepted" && (
                <FriendActionButton
                  icon={faUserMinus}
                  label="Unfriend"
                  mutation={unfriendMutation}
                  userId={user._id}
                  isFetching={isFetching}
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-content-header">
          <NavLink
            to=""
            onClick={(e) => {
              e.preventDefault();
              navigate("", { replace: true });
            }}
            className={({ isActive }) => (isActive ? "active" : "")}
            end
          >
            Posts
          </NavLink>

          <NavLink
            to="spotlists"
            onClick={(e) => {
              e.preventDefault();
              navigate("spotlists", { replace: true });
            }}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Spotlists
          </NavLink>

          <NavLink
            to="spots"
            onClick={(e) => {
              e.preventDefault();
              navigate("spots", { replace: true });
            }}
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
