import React, { useState, useEffect, useContext } from "react";
import { NavLink, Link, Outlet, useLocation } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import { formatTime } from "../utils/helperFunctions";

import axios from "axios";

export default function Chats() {
  const [recentChats, setRecentChats] = useState([]);

  const auth = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const location = useLocation();
  const pathSegment = location.pathname.split("/")[1];

  useEffect(() => {
    console.log("fetching chats");
    const fetchChats = async () => {
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
        console.log(err);
      }
    };
    fetchChats();
  }, [pathSegment]);

  useEffect(() => {
    if (!socket.socket) return;

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
      console.log("user-is-typing");
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
  console.log(recentChats);
  if (!auth.userData || !recentChats) return <div className="loader"></div>;
  return (
    <div className="messages-and-chat-container">
      <div
        className={`messages-container ${
          ["/messages", "/requests"].includes(location.pathname)
            ? "visible"
            : "hidden"
        }`}
      >
        <Link to="search-bar" className="messages-searchbar">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <span>Search</span>
        </Link>
        <div className="messages-header">
          <NavLink
            to="/messages"
            className={({ isActive }) =>
              isActive ? "messages-header-el active" : "messages-header-el"
            }
          >
            Messages
          </NavLink>
          <NavLink
            to="/requests"
            className={({ isActive }) =>
              isActive ? "messages-header-el active" : "messages-header-el"
            }
          >
            Requests
          </NavLink>
        </div>
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
                      backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${chat.otherParticipantData.photo})`,
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
