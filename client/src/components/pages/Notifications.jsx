import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

import { formatTimeAgo } from "../utils/helperFunctions";
import ShowOptions from "../common/ShowOptions";
import LoadingWave from "../common/LoadingWave";
import { getNotifications } from "../api/notificationsApis";

export default function Notifications() {
  const [options, setOptions] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["notification"],
    queryFn: getNotifications,
  });

  const notifications = data?.data;

  return (
    <div className="notifications-container">
      <div className="notifications-header">Notifications</div>
      <div className="notifications-body">
        {isLoading ? (
          <LoadingWave />
        ) : notifications.length > 0 ? (
          <div className="notifications-content">
            {notifications.map((notification) => {
              const linkUrl = notification.originDetails.spotlistId
                ? `/${notification.originDetails.author.handle}/spotlists/${notification.originDetails.spotlistId}`
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
                  <div
                    className={`${notification.isRead ? "new old" : "new"}`}
                  />
                  {notification.sender && (
                    <div
                      className="image"
                      style={{
                        backgroundImage: `url(${notification.sender.photo})`,
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
                      <ShowOptions options={options} setOptions={setOptions} />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="empty-notifications-message">
            Stay tuned! Your notifications will show up here.
          </div>
        )}
      </div>
      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
