import React, { useState, useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import { formatTime, compareTime } from "../utils/helperFunctions";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPaperPlane,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import ErrorPage from "../pages/ErrorPage";

export default function ChatRoom() {
  const [chatIsApproved, setChatIsApproved] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [chattingWithUser, setChattingWithUser] = useState(null);
  const [room, setRoom] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const auth = useContext(AuthContext);
  const currentUser = auth.userData;

  const socket = useContext(SocketContext);

  const params = useParams();

  useEffect(() => {
    const getChat = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `${process.env.REACT_APP_API_URL}/api/v1/chats?user1=${auth.userData._id}&user2=${params.id}`,
          withCredentials: true,
        });

        setChattingWithUser(res.data.user);
        setMessages(res.data.chat.messages);
        setRoom(res.data.chat._id);
        setChatIsApproved(res.data.chat.isApproved);
      } catch (err) {
        setError(err);
      }
    };

    if (!auth.userData) return;
    getChat();
  }, [auth.userData, params.id]);

  const leaveChatRoom = () => {
    if (!socket.socket) return;
    socket.socket.emit("leave-chat-room", room);
  };

  useEffect(() => {
    if (!chattingWithUser || !socket.socket) return;
    socket.socket.emit("enter-chat-room", room);

    socket.socket.on("receive-message", (message, approvedStatus) => {
      setMessages((prevMessages) => {
        return [message, ...prevMessages.filter((msg) => !msg.typingBubble)];
      });

      if (!chatIsApproved) {
        setChatIsApproved(approvedStatus);
      }
    });

    socket.socket.on("reciever-online", () => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        updatedMessages[0].isRead = true;
        return updatedMessages;
      });
    });

    socket.socket.on("update-read-state", (newMessages) => {
      setMessages(newMessages);
    });

    socket.socket.on("user-is-typing", () => {
      setIsTyping(true);
    });

    socket.socket.on("user-no-longer-typing", () => {
      setIsTyping(false);
    });

    return () => {
      leaveChatRoom();
      socket.socket.off("reciever-online");
      socket.socket.off("update-read-state");
    };
  }, [chattingWithUser, socket]);

  useEffect(() => {
    if (isTyping) {
      setMessages((prevMessages) => [
        {
          senderId: chattingWithUser._id,
          message: "...",
          firstOfType: true,
          typingBubble: true,
        },
        ...prevMessages,
      ]);
    } else {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => !msg.typingBubble)
      );
    }
  }, [isTyping]);

  const sendMessage = () => {
    if (newMessage === "") return;

    const isFirstMessage =
      messages.length === 0 || messages[0].senderId !== auth.userData._id;

    const thisMessageDate = formatTime(new Date());
    const lastMessageDate = formatTime(new Date(messages[0]?.timestamp));

    const compareTimes = compareTime(thisMessageDate, lastMessageDate);

    const isFirstOfDay = messages.length === 0 || compareTimes;

    const newMsg = {
      senderId: currentUser._id,
      message: newMessage,
      firstOfType: isFirstMessage,
      dayInfo: {
        isFirstMessage: isFirstOfDay,
        date: thisMessageDate,
      },
      timestamp: new Date(),
      isRead: false,
    };

    setMessages((prevMessages) => {
      const filteredMessages = prevMessages.filter((msg) => !msg.typingBubble);
      return [newMsg, ...filteredMessages];
    });

    if (!chatIsApproved && messages.length > 0) {
      if (messages[messages.length - 1].senderId !== newMsg.senderId)
        setChatIsApproved(true);
    }

    socket.socket.emit("send-message", newMsg, room, chattingWithUser._id);

    setNewMessage("");
    typingRef.current = false;
    clearTimeout(timeoutRef.current);
    socket.socket.emit("user-no-longer-typing", room, auth.userData._id);
  };

  const timeoutRef = useRef(null);
  const typingRef = useRef(null);

  useEffect(() => {
    if (newMessage !== "") {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (!typingRef.current) {
        socket.socket.emit("user-is-typing", room, auth.userData._id);
        typingRef.current = true;
      }

      timeoutRef.current = setTimeout(() => {
        socket.socket.emit("user-no-longer-typing", room, auth.userData._id);
        typingRef.current = false;
      }, 2000);
    }
  }, [newMessage]);

  useEffect(() => {
    if (!messagesEndRef.current) return;
    scrollTheDiv();
  }, [messages, newMessage]);

  const scrollTheDiv = () => {
    messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
  };

  const DisplayChat = () => {
    const todayDate = formatTime(new Date());
    return messages.map((message, index) => {
      const isSenderMe = message.senderId === currentUser._id;

      let messageStyle = isSenderMe ? "your-message " : "friend-message ";

      if (message.firstOfType)
        messageStyle += isSenderMe ? "first-of-me" : "first-of-friend";

      const messageReadStyle = message.isRead
        ? "message-read"
        : "message-not-read";

      let messageTimeLabel;

      if (message.dayInfo?.isFirstMessage) {
        if (message.dayInfo.date === todayDate) messageTimeLabel = "Today";
        else
          messageTimeLabel = message.dayInfo.date
            .split("/")
            .slice(0, 2)
            .join("/");
      }

      return (
        <React.Fragment key={message._id || index}>
          <div className={`chat-bubble ${messageStyle}`}>
            <p>{message.message}</p>
            <div className="message-time">
              {message.timestamp &&
                new Date(message.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              {chatIsApproved && isSenderMe && (
                <FontAwesomeIcon icon={faCheck} className={messageReadStyle} />
              )}
            </div>
          </div>
          {messageTimeLabel && (
            <div className="chat-messages-time">{messageTimeLabel}</div>
          )}
        </React.Fragment>
      );
    });
  };

  if (error) return <ErrorPage error={error} />;

  if (!chattingWithUser) return <div className="loader big" />;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <Link to="/messages">
          <div className="svg-wrapper">
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
        </Link>
        <Link
          to={`/${chattingWithUser.handle}`}
          className="chat-header-img"
          style={{
            backgroundImage: `url(${chattingWithUser.photo})`,
          }}
        >
          {chatIsApproved && chattingWithUser.isOnline && (
            <div className="online-bubble"></div>
          )}
        </Link>
        <div className="chat-header-info">
          <Link to={`/${chattingWithUser.handle}`} className="name">
            {chattingWithUser.name}
          </Link>
          {chatIsApproved && (
            <span>
              {isTyping
                ? "is typing..."
                : chattingWithUser.isOnline
                ? "Online"
                : "Offline"}
            </span>
          )}
        </div>
      </div>
      <div className="chat-messages" ref={messagesEndRef}>
        <DisplayChat />
      </div>
      {!chatIsApproved &&
        messages.length > 0 &&
        messages[messages.length - 1].senderId !== auth.userData._id && (
          <div className="chat-messages-not-approved">
            <p>{`If you respond ${chattingWithUser.name} will be able to see your online and read message status`}</p>
          </div>
        )}
      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Message"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <button className="send-button" onClick={sendMessage}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </div>
    </div>
  );
}
