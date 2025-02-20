import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Alert from "./components/common/Alert";

import HomePage from "./components/posts/HomePage";
import PostDetail from "./components/posts/PostDetail";
import PostCreate from "./components/posts/PostCreate";

import SpotDetail from "./components/spot/SpotDetail";

import Notifications from "./components/pages/Notifications";

import ChatRoom from "./components/messages/ChatRoom";
import UserSearch from "./components/common/UserSearch";

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
import PublicRoute from "./components/auth/PublicRoute";
import RedirectRoute from "./components/auth/RedirectRoute";
import Layout from "./components/common/Layout";

import NotFoundPage from "./components/pages/NotFoundPage";
import Discover from "./components/discover/DiscoverPage";
import AreaSearchFilters from "./components/discover/AreaSearchFilters";
import Results from "./components/discover/Results";
import CreateSpot from "./components/discover/CreateSpot";
import SpotlistsHub from "./components/discover/SpotlistsHub";
import Bookmarks from "./components/pages/Bookmarks";
import ProfileSpots from "./components/profile/ProfileSpots";
import SpotLiblary from "./components/discover/SpotLiblary";
import AdminRoute from "./components/auth/AdminRoute";
import Reports from "./components/pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Alert />
      <Routes>
        <Route element={<Layout />}>
          <Route element={<PublicRoute />}>
            <Route path="/" element={<HomePage />}>
              <Route
                path="create-post"
                element={
                  <PrivateRoute message="You need to be logged in to create posts">
                    <PostCreate />
                  </PrivateRoute>
                }
              />
            </Route>
          </Route>

          <Route path="/:handle/:postId" element={<PostDetail />} />

          <Route path="/spot/:id" element={<SpotDetail />} />

          {/* SPOTLISTS  */}
          <Route
            path="spotlists"
            element={
              <PrivateRoute message="You need to be logged in to view your spotlists">
                <SpotlistsPage />
              </PrivateRoute>
            }
          />
          <Route path="spotlists/:id" element={<SpotlistContent />} />

          <Route
            element={
              <PrivateRoute message="You need to be logged in to chat with other users" />
            }
          >
            <Route path="messages" element={<Chats />}>
              <Route path="chat-room/:id" element={<ChatRoom />} />
            </Route>

            <Route path="requests" element={<Chats />}>
              <Route path="chat-room/:id" element={<ChatRoom />} />
            </Route>
          </Route>

          <Route
            path="/search-bar"
            element={
              <PrivateRoute message="You need to be logged in to search other users">
                <UserSearch />
              </PrivateRoute>
            }
          />

          {/* Friends Section */}

          <Route
            element={
              <PrivateRoute message="You need to be logged in to add and accept friend requests" />
            }
          >
            <Route path="friends" element={<FriendsPage />}>
              <Route index element={<FriendsList />} />
              <Route path="requests" element={<FriendsRequests />} />
            </Route>
          </Route>

          <Route
            path="login"
            element={
              <RedirectRoute>
                <Login />
              </RedirectRoute>
            }
          />
          <Route
            path="signup"
            element={
              <RedirectRoute>
                <Signup />
              </RedirectRoute>
            }
          />

          <Route
            path="notifications"
            element={
              <PrivateRoute message="You need to be logged in to view your notifications">
                <Notifications />
              </PrivateRoute>
            }
          />

          {/* Profile section  */}
          <Route path="/:handle" element={<Profile />}>
            <Route index element={<ProfilePosts />} />
            <Route path="spotlists" element={<ProfileSpotlists />} />
            <Route path="spots" element={<ProfileSpots />} />
          </Route>

          <Route path="/:handle/spotlists/:id" element={<SpotlistContent />} />

          <Route
            path="/bookmarks"
            element={
              <PrivateRoute message="You need to be logged in to view your bookmarks">
                <Bookmarks />
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute message="You need to be logged in to change your account settings">
                <Settings />
              </PrivateRoute>
            }
          />

          <Route path="/discover" element={<Discover />} />
          <Route path="/discover/area-search" element={<AreaSearchFilters />} />

          <Route path="/discover/area-search/results" element={<Results />} />

          <Route path="/discover/spotlists-hub" element={<SpotlistsHub />} />

          <Route path="/discover/spot-liblary" element={<SpotLiblary />} />

          <Route
            path="/discover/spotlists-hub/:id"
            element={<SpotlistContent />}
          />

          <Route
            path="/create-spot"
            element={
              <PrivateRoute message="You need to be logged in to create new spots">
                <CreateSpot />
              </PrivateRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <AdminRoute message="You are not authorized to view user reports">
                <Reports />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
