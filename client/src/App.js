import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContextProvider } from "./components/context/AuthContext";
import { ResultsContextProvider } from "./components/context/ResultsContext";
import { SocketContextProvider } from "./components/context/SocketContext";
import { AlertContextProvider } from "./components/context/AlertContext";
import Alert from "./components/common/Alert";

import HomePage from "./components/posts/HomePage";
import PostDetail from "./components/posts/PostDetail";
import PostCreate from "./components/posts/PostCreate";

import GoogleMap from "./components/map/GoogleMap";
import SpotDetail from "./components/map/SpotDetail";

import Notifications from "./components/pages/Notifications";

import ChatRoom from "./components/messages/ChatRoom";
import ChatSearchBar from "./components/messages/ChatSearchBar";

import SpotlistsPage from "./components/spotlists/SpotlistsPage";

import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";

import Chats from "./components/messages/Chats";

import SpotlistContent from "./components/spotlists/SpotlistContent";

import FriendsPage from "./components/friends/FriendsPage";
import FriendsList from "./components/friends/FriendsList";
import FriendsRequests from "./components/friends/FriendsRequests";

import Profile from "./components/profile/Profile";
import { ProfilePosts } from "./components/profile/ProfilePosts";
import { ProfileSpotlists } from "./components/profile/ProfileSpotlists";

import Settings from "./components/pages/Settings";

import PrivateRoute from "./components/auth/PrivateRoute";
import Layout from "./components/common/Layout";

import NotFoundPage from "./components/pages/NotFoundPage";

function App() {
  return (
    <AlertContextProvider>
      <AuthContextProvider>
        <SocketContextProvider>
          <ResultsContextProvider>
            <BrowserRouter>
              <Alert />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route path="/home" element={<HomePage />}>
                    <Route path="create-post" element={<PostCreate />} />
                  </Route>

                  <Route path="/:handle/:postId" element={<PostDetail />} />

                  <Route path="/spot/:id" element={<SpotDetail />} />

                  <Route path="search" element={<GoogleMap />} />
                  <Route path="search/:id" element={<SpotDetail />} />

                  {/* SPOTLISTS  */}
                  <Route path="spotlists" element={<SpotlistsPage />} />
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

                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />

                  <Route path="notifications" element={<Notifications />} />

                  {/* Profile section  */}
                  <Route
                    path="/:handle"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<ProfilePosts />} />
                    <Route path="spotlists" element={<ProfileSpotlists />} />
                  </Route>

                  <Route
                    path="/:handle/spotlists/list/:id"
                    element={<SpotlistContent />}
                  />

                  <Route
                    path="/settings"
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
          </ResultsContextProvider>
        </SocketContextProvider>
      </AuthContextProvider>
    </AlertContextProvider>
  );
}

export default App;
