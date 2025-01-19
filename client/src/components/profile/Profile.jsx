import React, { useState, useEffect, useContext } from "react";
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

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [spotlists, setSpotlists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [options, setOptions] = useState(false);

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [inviteStatus, setInviteStatus] = useState(null);

  const params = useParams();
  const navigate = useNavigate();

  const { userData } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${params.handle}`,
          withCredentials: true,
        });
        console.log(res);
        setUser(res.data.data.viewedUser);
        setPosts(res.data.data.posts);
        if (res.data.data.inviteStatus)
          setInviteStatus(res.data.data.inviteStatus);
        setSpotlists(res.data.data.spotlists);
        setIsLoading(false);
      } catch (err) {
        console.log(err);
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [params]);

  if (!user && isLoading) return <div className="loader" />;
  if (!user && !isLoading) return <div>This account doesn't exist</div>;

  return (
    <div className="profile-container">
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
        </div>
        <div className="profile-content-body">
          <Outlet
            context={{ posts, spotlists, setSpotlists, options, setOptions }}
          />
        </div>
      </div>
      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
