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
  useLocation,
} from "react-router-dom";
import { AuthContext } from "./components/context/AuthContext";
import { ResultsContext } from "./components/context/ResultsContext";
import { SocketContext } from "./components/context/SocketContext";
import { AlertContext } from "./components/context/AlertContext";
import Alert from "./components/common/Alert";

import { checkCookies } from "./components/utils/helperFunctions";

import Nav from "./components/common/Nav";
import Header from "./components/common/Header";
import Sidenav from "./components/common/Sidenav";

import GoogleMap from "./components/map/GoogleMap";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Account from "./components/account/Account";
import Settings from "./components/account/Settings";
import Spotlists from "./components/favourites/Spotlists";
import SpotDetail from "./components/map/SpotDetail";
import Chats from "./components/friends/Chats";

import FriendsPage from "./components/friends/FriendsPage";
import FriendsList from "./components/friends/FriendsList";
import FriendsRequests from "./components/friends/FriendsRequests";

import ChatRoom from "./components/friends/ChatRoom";
import Profile from "./components/friends/Profile";
import ChatSearchBar from "./components/friends/ChatSearchBar";
import Posts from "./components/posts/Posts";
import PostCreate from "./components/posts/PostCreate";

import NotFoundPage from "./components/pages/NotFoundPage";

import { io } from "socket.io-client";
import SpotlistContent from "./components/favourites/SpotlistContent";
import PostDetail from "./components/posts/PostDetail";
import Notifications from "./components/pages/Notifications";

function Layout() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="container">
      <Header setShowMenu={setShowMenu} />
      <div className="content">
        <Outlet />
      </div>
      <Nav />
      {showMenu && <Sidenav setShowMenu={setShowMenu} />}
      {showMenu && (
        <div className="sidebar-overlay" onClick={() => setShowMenu(false)} />
      )}
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
                <Route path="/" element={<Layout />}>
                  <Route path="/home" element={<Posts />}>
                    <Route path="create-post" element={<PostCreate />} />
                  </Route>

                  <Route path="/:handle/:postId" element={<PostDetail />} />

                  <Route path="/spot/:id" element={<SpotDetail />} />

                  <Route path="search" element={<GoogleMap />} />
                  <Route path="search/:id" element={<SpotDetail />} />

                  {/* SPOTLISTS  */}
                  <Route path="spotlists" element={<Spotlists />} />
                  <Route
                    path="spotlists/list/:id"
                    element={<SpotlistContent />}
                  />

                  <Route path="messages" element={<Chats />}>
                    <Route path="chat-room/:id" element={<ChatRoom />} />
                  </Route>

                  <Route path="requests" element={<Chats />}>
                    <Route path="chat-room/:id" element={<ChatRoom />} />
                  </Route>

                  <Route
                    path="messages/search-bar"
                    element={<ChatSearchBar />}
                  />

                  {/* Friends Section */}

                  <Route path="friends" element={<FriendsPage />}>
                    <Route index element={<FriendsList />} />
                    <Route path="requests" element={<FriendsRequests />} />
                  </Route>

                  <Route path="/profile/:id" element={<Profile />} />
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />

                  <Route path="notifications" element={<Notifications />} />

                  <Route
                    path="/:handle"
                    element={
                      <PrivateRoute>
                        <Account />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/:handle/settings"
                    element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
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
