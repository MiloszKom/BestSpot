import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import MobileMenu from "./components/MobileMenu";

export default function FriendRequests() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [friendNav, setFriendNav] = useState(() => {
    return localStorage.getItem("friendNav") || "friends";
  });
  const [userData, setUserData] = useState(null);

  const auth = useContext(AuthContext);

  useEffect(() => {
    if (auth.userData) {
      getUser();
    }
  }, [auth.userData]);

  const getUser = async () => {
    try {
      console.log(
        "Url: ",
        `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${auth.userData._id}`
      );
      const res = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${auth.userData._id}`,
        withCredentials: true,
      });
      console.log(res.data.data.user);
      setUserData(res.data.data.user);
    } catch (err) {
      console.log(err);
    }
  };

  const acceptFriend = async (friendId) => {
    try {
      const res = await axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/acceptFriendRequest/${friendId}`,
        withCredentials: true,
      });
      console.log(res);
      getUser();
    } catch (err) {
      console.log(err);
    }
  };

  const rejectFriend = async (friendId) => {
    try {
      const res = await axios({
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/rejectFriendRequest/${friendId}`,
        withCredentials: true,
      });
      console.log(res);
      getUser();
    } catch (err) {
      console.log(err);
    }
  };

  const showMenu = () => {
    setMobileMenu(true);
  };

  useEffect(() => {
    localStorage.setItem("friendNav", friendNav);
  }, [friendNav]);

  let onlineFriendsCount;
  if (userData) {
    onlineFriendsCount = userData.friends.filter(
      (friend) => friend.isOnline
    ).length;
  }

  if (!userData) return <div className="loader"></div>;

  return (
    <>
      <div className="messages-container">
        <div className="messages-header friendReq-header">
          <div className="messages-menu" onClick={showMenu}>
            <FontAwesomeIcon icon={faBars} />
          </div>
          <h2>Friends</h2>
        </div>
        <div className="friend-nav">
          <div
            className={friendNav === "friends" ? "active" : ""}
            onClick={() => setFriendNav("friends")}
          >
            Friend List
          </div>
          <div
            className={friendNav === "requests" ? "active" : ""}
            onClick={() => setFriendNav("requests")}
          >
            Friend Requests
          </div>
        </div>
        {friendNav === "friends" && (
          <div className="friends-container">
            <div className="friends-list-header">
              <h2>{`${userData.friends.length} friends`}</h2>
              <p>{`${onlineFriendsCount} friends online`}</p>
            </div>
            {userData.friends.map((el) => {
              return (
                <div className="friend-list-el" key={el._id}>
                  <Link
                    to={`/profile/${el._id}`}
                    className="friend-list-el-info"
                  >
                    <div
                      className="friend-list-el-img"
                      style={{
                        backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${el.photo})`,
                      }}
                    >
                      {el.isOnline && <div className="online-bubble"></div>}
                    </div>

                    <span>{el.name}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        {friendNav === "requests" && (
          <div className="friend-requests-container">
            {userData.pendingRequests.map((el) => {
              return (
                <div className="friend-request-el" key={el._id}>
                  <Link
                    to={`/profile/${el._id}`}
                    className="friend-request-el-info"
                  >
                    <div
                      className="friend-request-el-img"
                      style={{
                        backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${el.photo})`,
                      }}
                    ></div>
                    <span>{el.name}</span>
                  </Link>
                  <div className="accept-options">
                    <div
                      className="accept-request"
                      onClick={() => acceptFriend(el._id)}
                    >
                      Accept
                    </div>
                    <div
                      className="decline-request"
                      onClick={() => rejectFriend(el._id)}
                    >
                      Decline
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {mobileMenu && <MobileMenu setMobileMenu={setMobileMenu} />}
    </>
  );
}
