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

import SpotDetail from "./components/spot/SpotDetail";

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
import Discover from "./components/discover/DiscoverPage";
import AreaSearchFilters from "./components/discover/AreaSearchFilters";
import Results from "./components/discover/Results";
import SpotAdd from "./components/discover/SpotAdd";
import SpotlistsHub from "./components/discover/SpotlistsHub";
import Bookmarks from "./components/pages/Bookmarks";

function App() {
  return (
    <AlertContextProvider>
      <AuthContextProvider>
        <SocketContextProvider>
          <ResultsContextProvider>
            <BrowserRouter>
              <Alert />
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />}>
                    <Route path="create-post" element={<PostCreate />} />
                  </Route>

                  <Route path="/:handle/:postId" element={<PostDetail />} />

                  <Route path="/spot/:id" element={<SpotDetail />} />

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
                    path="/bookmarks"
                    element={
                      <PrivateRoute>
                        <Bookmarks />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    }
                  />

                  <Route path="/discover" element={<Discover />} />
                  <Route
                    path="/discover/area-search"
                    element={<AreaSearchFilters />}
                  />

                  <Route path="/discover/add-spot" element={<SpotAdd />} />

                  <Route
                    path="/discover/area-search/results"
                    element={<Results />}
                  />

                  <Route
                    path="/discover/spotlists-hub"
                    element={<SpotlistsHub />}
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
