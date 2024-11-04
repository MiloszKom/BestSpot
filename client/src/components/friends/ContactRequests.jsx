import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import { formatTime } from "../utils/helperFunctions";

import MobileMenu from "./components/MobileMenu";
import axios from "axios";

export default function ContactRequests() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [recentChats, setRecentChats] = useState([]);

  const auth = useContext(AuthContext);

  const showMenu = () => {
    setMobileMenu(true);
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios({
          method: "GET",
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/chats/request-chats`,
          withCredentials: true,
        });
        setRecentChats(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchChats();
  }, []);

  const todayDate = formatTime(new Date());
  if (!auth.userData || !recentChats) return <div className="loader"></div>;
  return (
    <>
      <div className="messages-container">
        <div className="messages-header">
          <div className="messages-menu" onClick={showMenu}>
            <FontAwesomeIcon icon={faBars} />
          </div>
          <h2>Contact Requests</h2>
        </div>
        <div className="contact-request-info">
          Chats from people outside your friend list appear here. Respond or add
          them as a friend to move the chat to your main list.
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
                  to={`/messages/chat-room/${chat.otherParticipantData._id}`}
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
                  ></div>
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
