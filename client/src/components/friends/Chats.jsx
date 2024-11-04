import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import { formatTime } from "../utils/helperFunctions";

import MobileMenu from "./components/MobileMenu";
import axios from "axios";

export default function Chats({ setShowNavbar }) {
  useEffect(() => {
    setShowNavbar(true);
  }, [setShowNavbar]);

  const [mobileMenu, setMobileMenu] = useState(false);
  const [recentChats, setRecentChats] = useState([]);

  const auth = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const showMenu = () => {
    setMobileMenu(true);
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios({
          method: "GET",
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/chats/approved-chats`,
          withCredentials: true,
        });
        setRecentChats(res.data.data);
        console.log(res);
      } catch (err) {
        console.log(err);
      }
    };
    fetchChats();
  }, []);

  useEffect(() => {
    if (!socket.socket) return;

    socket.socket.on("receive-message", (message) => {
      setRecentChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat.otherParticipantData._id === message.senderId) {
            return {
              ...chat,
              lastMessage: message,
              unreadMessages: (chat.unreadMessages || 0) + 1,
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

    return () => {};
  }, [socket.socket]);

  const todayDate = formatTime(new Date());
  if (!auth.userData || !recentChats) return <div className="loader"></div>;
  return (
    <>
      <div className="messages-container">
        <div className="messages-header">
          <div className="messages-menu" onClick={showMenu}>
            <FontAwesomeIcon icon={faBars} />
          </div>
          <h2>Chats</h2>
        </div>
        <Link to="search-bar" className="messages-searchbar">
          <FontAwesomeIcon icon={faMagnifyingGlass} />
          <span>Search</span>
        </Link>
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
      {mobileMenu && <MobileMenu setMobileMenu={setMobileMenu} />}
    </>
  );
}
