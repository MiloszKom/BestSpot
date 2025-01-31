import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

import { formatTimeAgo } from "../utils/helperFunctions";
import ShowOptions from "../common/ShowOptions";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [options, setOptions] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/notifications`,
          withCredentials: true,
        });
        console.log(res);
        setNotifications(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchNotification();
  }, []);

  return (
    <div className="notifications-container">
      <div className="notifications-header">Notifications</div>
      <div className="notifications-body">
        {notifications.map((notification) => {
          const linkUrl = notification.originDetails.spotlistId
            ? `/${notification.originDetails.author.handle}/spotlists/list/${notification.originDetails.spotlistId}`
            : notification.originDetails.spotId
            ? `/spot/${notification.originDetails.spotId}`
            : `/${notification.originDetails.author.handle}/${notification.originDetails.postId}`;

          return (
            <Link
              to={linkUrl}
              state={{
                highlightedCommentId: notification.originDetails.commentId,
                highlightedReplyId: notification.originDetails.replyId,
                highlightedInsightId: notification.originDetails.insightId,
              }}
              className="notification-el"
              key={notification._id}
            >
              <div className={`${notification.isRead ? "new old" : "new"}`} />
              {notification.sender && (
                <div
                  className="image"
                  style={{
                    backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${notification.sender.photo})`,
                  }}
                />
              )}

              <div className="info">
                <div className="info-summary">
                  {notification.title}{" "}
                  <span>· {formatTimeAgo(notification.createdAt)}</span>
                </div>
                <div className="info-details">{notification.message}</div>
              </div>
              <div className="options" onClick={(e) => e.preventDefault()}>
                <div
                  className="options-button"
                  onClick={() =>
                    setOptions({
                      notificationId: notification._id,
                      aviableOptions: ["delete"],
                      entity: "notification",
                    })
                  }
                >
                  <FontAwesomeIcon icon={faEllipsisVertical} />
                </div>

                {options.notificationId === notification._id && (
                  <ShowOptions
                    options={options}
                    setOptions={setOptions}
                    setData={setNotifications}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
