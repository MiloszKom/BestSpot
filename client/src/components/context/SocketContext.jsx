// SocketContext.js
import { useContext, createContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

import { AuthContext } from "./AuthContext";

export const SocketContext = createContext({
  socket: null,
  setSocket: () => {},
});

export const SocketContextProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef();

  const { userData } = useContext(AuthContext);

  useEffect(() => {
    if (!userData) return;

    socketRef.current = io(`${process.env.REACT_APP_API_URL}`);

    socketRef.current.on("connect", () => {
      setSocket(socketRef.current);

      socketRef.current.emit("user-online", userData._id, userData.chatsJoined);
    });

    socketRef.current.on("connect_error", (err) => {
      console.error("Connection failed:", err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userData]);

  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
