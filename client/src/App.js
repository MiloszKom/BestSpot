import React, {
  useState,
  useCallback,
  useEffect,
  useContext,
  useRef,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./components/context/AuthContext";
import { ResultsContext } from "./components/context/ResultsContext";
import { SocketContext } from "./components/context/SocketContext";
import { AlertContext } from "./components/context/AlertContext";
import Alert from "./components/common/Alert";

import { checkCookies } from "./components/utils/helperFunctions";

import Navbar from "./components/common/Navbar";
import GoogleMap from "./components/map/GoogleMap";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Account from "./components/account/Account";
import Settings from "./components/account/Settings";
import Favourites from "./components/favourites/Favourites";
import Spotlists from "./components/favourites/Spotlists";
import SpotDetail from "./components/map/SpotDetail";
import Chats from "./components/friends/Chats";
import Friends from "./components/friends/Friends";
import ChatRoom from "./components/friends/ChatRoom";
import Profile from "./components/friends/Profile";
import ChatSearchBar from "./components/friends/ChatSearchBar";
import ContactRequests from "./components/friends/ContactRequests";

import { io } from "socket.io-client";
import SpotlistContent from "./components/favourites/SpotlistContent";

function Layout({ showNavbar }) {
  return (
    <div className="container">
      <Outlet />
      {showNavbar && <Navbar />}
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isDataFetched, userData } = useContext(AuthContext);
  if (isDataFetched === false) {
    return <div>Loading...</div>;
  } else {
    return userData ? children : <Navigate to="/login" replace />;
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [alertData, setAlertData] = useState({});
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const fetchCookies = async () => {
      const result = await checkCookies();
      if (result) {
        setIsLoggedIn(true);
        setUserData(result.user);
        setToken(result.token);
      }
      setIsDataFetched(true);
    };

    fetchCookies();
  }, []);

  const login = useCallback((data) => {
    setIsLoggedIn(true);
    setUserData(data.data.user);
  }, []);

  const logout = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setIsLoggedIn(false);
    setUserData(null);
    setIsDataFetched(false);
    setSocket(null);
  }, []);

  const getResults = useCallback((data) => {
    setSearchResults(data);
  }, []);

  const deleteResults = useCallback(() => {
    setSearchResults(null);
  }, []);

  const socketRef = useRef();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!userData) return;

    socketRef.current = io(`http://${process.env.REACT_APP_SERVER}:5000`);

    socketRef.current.on("connect", () => {
      setSocket(socketRef.current);
      console.log(`You connected with the server!`);

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

  const showAlert = useCallback((msg, type) => {
    setAlertData({
      alertMsg: msg,
      alertType: type,
    });
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      <SocketContext.Provider value={{ socket }}>
        <AuthContext.Provider
          value={{ isLoggedIn, login, logout, userData, isDataFetched, token }}
        >
          <ResultsContext.Provider
            value={{ searchResults, getResults, deleteResults }}
          >
            <BrowserRouter>
              <Alert msg={alertData.alertMsg} type={alertData.alertType} />
              <Routes>
                <Route path="/" element={<Layout showNavbar={showNavbar} />}>
                  <Route index element={<Navigate to="/search" replace />} />

                  <Route
                    path="search"
                    element={<GoogleMap setShowNavbar={setShowNavbar} />}
                  />

                  <Route
                    path="search/:id"
                    element={<SpotDetail setShowNavbar={setShowNavbar} />}
                  />

                  <Route path="spotlists" element={<Spotlists />} />
                  <Route path="spotlists/:name" element={<SpotlistContent />} />
                  <Route
                    path="spotlists/:name/:id"
                    element={<SpotDetail setShowNavbar={setShowNavbar} />}
                  />

                  <Route path="favourites" element={<Favourites />} />

                  <Route
                    path="favourites/:id"
                    element={<SpotDetail setShowNavbar={setShowNavbar} />}
                  />

                  <Route
                    path="messages"
                    element={<Chats setShowNavbar={setShowNavbar} />}
                  />

                  <Route
                    path="messages/search-bar"
                    element={<ChatSearchBar setShowNavbar={setShowNavbar} />}
                  />

                  <Route
                    path="messages/friend-requests"
                    element={<Friends setShowNavbar={setShowNavbar} />}
                  />

                  <Route
                    path="messages/contact-requests"
                    element={<ContactRequests setShowNavbar={setShowNavbar} />}
                  />

                  <Route
                    path="messages/chat-room/:id"
                    element={<ChatRoom setShowNavbar={setShowNavbar} />}
                  />

                  <Route path="/profile/:id" element={<Profile />} />

                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />

                  <Route
                    path="account"
                    element={
                      <PrivateRoute>
                        <Account />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="account/settings"
                    element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/search" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ResultsContext.Provider>
        </AuthContext.Provider>
      </SocketContext.Provider>
    </AlertContext.Provider>
  );
}

export default App;
