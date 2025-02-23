import React, { useState, useEffect, useContext } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";

import LoadingWave from "../common/LoadingWave";

import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import { formatTime } from "../utils/helperFunctions";

import axios from "axios";

export default function Chats() {
  const [recentChats, setRecentChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const auth = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const location = useLocation();
  const pathSegment = location.pathname.split("/")[1];

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoading(true);
      try {
        const res = await axios({
          method: "GET",
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/chats/${
            pathSegment === "messages" ? "approved" : "request"
          }-chats`,
          withCredentials: true,
        });
        setRecentChats(res.data.data);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    };
    fetchChats();
  }, [pathSegment]);

  useEffect(() => {
    if (!socket.socket) return;

    socket.socket.on("update-recent-chats", (updatedChat) => {
      setRecentChats((prevChats) => {
        return prevChats.map((chat) => {
          if (
            updatedChat.participants.includes(chat.otherParticipantData._id)
          ) {
            return {
              ...chat,
              lastMessage: updatedChat.messages[0],
              unreadMessages: updatedChat.messages.filter(
                (msg) => !msg.isRead && msg.senderId !== auth.userData._id
              ).length,
            };
          }
          return chat;
        });
      });
    });

    socket.socket.on("receive-message", (message) => {
      setRecentChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.otherParticipantData._id === message.senderId) {
            return {
              ...chat,
              lastMessage: message,
              unreadMessages:
                (chat.unreadMessages || 0) + (message.isInChatRoom ? 0 : 1),
            };
          }
          return chat;
        });
      });
    });

    socket.socket.on("user-is-typing", (userId) => {
      setRecentChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.otherParticipantData._id === userId) {
            if (chat.isBeingTyped) return chat;
            const originalMessage = chat.lastMessage;
            return {
              ...chat,
              lastMessage: {
                ...chat.lastMessage,
                message: "typing...",
              },
              isBeingTyped: true,
              originalLastMessage: originalMessage,
            };
          }
          return chat;
        });
      });
    });

    socket.socket.on("user-no-longer-typing", (userId) => {
      setRecentChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.otherParticipantData._id === userId) {
            return {
              ...chat,
              lastMessage: chat.originalLastMessage || chat.lastMessage,
              isBeingTyped: false,
              originalLastMessage: null,
            };
          }
          return chat;
        })
      );
    });

    socket.socket.on("update-notifications", (otherParticipantId) => {
      if (!recentChats) return;
      setRecentChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.otherParticipantData._id === otherParticipantId) {
            return {
              ...chat,
              lastMessage: {
                ...chat.lastMessage,
                isRead: true,
              },
              unreadMessages: 0,
            };
          }
          return chat;
        });
      });
    });

    return () => {};
  }, [socket.socket]);

  const todayDate = formatTime(new Date());
  if (!auth.userData || !recentChats) return <div className="loader big"></div>;

  return (
    <div className="messages-and-chat-container">
      <div
        className={`messages-container ${
          ["/messages", "/requests"].includes(location.pathname)
            ? "visible"
            : "hidden"
        }`}
      >
        <div className="messages-header">Messages</div>
        <div className="social-nav">
          <NavLink
            to="/messages"
            className={({ isActive }) =>
              isActive ? "social-nav-el active" : "social-nav-el"
            }
          >
            Inbox
          </NavLink>
          <NavLink
            to="/requests"
            className={({ isActive }) =>
              isActive ? "social-nav-el active" : "social-nav-el"
            }
          >
            Requests
          </NavLink>
          <NavLink to="/search-bar" className="social-nav-el search">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </NavLink>
        </div>

        {isLoading ? (
          <LoadingWave />
        ) : recentChats.length > 0 ? (
          <div className="messages-chats">
            {recentChats
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.lastMessage?.timestamp) -
                  new Date(a.lastMessage?.timestamp)
              )
              .map((chat) => {
                if (!chat.lastMessage) return null;
                const lastMessage =
                  chat.lastMessage.senderId === auth.userData._id &&
                  !chat.isBeingTyped
                    ? "Me: " + chat.lastMessage.message
                    : chat.lastMessage.message;

                const messageDate = formatTime(
                  new Date(chat.lastMessage.timestamp)
                );

                const messageTime =
                  messageDate === todayDate
                    ? new Date(chat.lastMessage?.timestamp).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )
                    : messageDate;

                return (
                  <Link
                    to={`chat-room/${chat.otherParticipantData._id}`}
                    className={`messages-chats-el ${
                      !chat.lastMessage.isRead &&
                      chat.lastMessage.senderId !== auth.userData._id
                        ? "new-messages"
                        : ""
                    }`}
                    key={chat.otherParticipantData._id}
                  >
                    <div
                      className="messages-chats-el-img"
                      style={{
                        backgroundImage: `url(${chat.otherParticipantData.photo})`,
                      }}
                    >
                      {chat.isApproved &&
                        (chat.otherParticipantData.isOnline ? (
                          <div className="online-bubble"></div>
                        ) : (
                          <div className="offline-bubble"></div>
                        ))}
                    </div>
                    <div className="messages-chats-el-info">
                      <div className="info-name">
                        {chat.otherParticipantData.name}
                      </div>
                      {chat.unreadMessages > 0 && (
                        <div className="info-undread-messages">
                          {chat.unreadMessages > 9 ? "9+" : chat.unreadMessages}
                        </div>
                      )}
                      <div className="info-message">{lastMessage}</div>
                      <div className="info-time">
                        {!chat.isBeingTyped && messageTime}
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        ) : (
          <div className="messages-container-empty">
            {pathSegment === "messages"
              ? "No messages yet. Start a conversation to see them here!"
              : "No one has reached out yet. Message requests will show up here."}
          </div>
        )}
      </div>
      <div
        className={`chat-section ${
          ["/messages", "/requests"].includes(location.pathname) ? "hidden" : ""
        }`}
      >
        {["/messages", "/requests"].includes(location.pathname) ? (
          <div className="start-chat">Select a contact to start chatting!</div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}
