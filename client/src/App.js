import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Alert = lazy(() => import("./components/common/Alert"));
const PrivateRoute = lazy(() => import("./components/auth/PrivateRoute"));
const PublicRoute = lazy(() => import("./components/auth/PublicRoute"));
const RedirectRoute = lazy(() => import("./components/auth/RedirectRoute"));
const AdminRoute = lazy(() => import("./components/auth/AdminRoute"));
const Layout = lazy(() => import("./components/common/Layout"));
const Login = lazy(() => import("./components/auth/Login"));
const Signup = lazy(() => import("./components/auth/Signup"));
const HomePage = lazy(() => import("./components/posts/HomePage"));
const PostDetail = lazy(() => import("./components/posts/PostDetail"));
const PostCreate = lazy(() => import("./components/posts/PostCreate"));
const Discover = lazy(() => import("./components/discover/DiscoverPage"));
const SpotlistsHub = lazy(() => import("./components/discover/SpotlistsHub"));
const SpotLibrary = lazy(() => import("./components/discover/SpotLibrary"));
const AreaSearchFilters = lazy(() =>
  import("./components/discover/AreaSearchFilters")
);
const Results = lazy(() => import("./components/discover/Results"));
const ProfileSpots = lazy(() => import("./components/profile/ProfileSpots"));
const SpotlistsPage = lazy(() =>
  import("./components/spotlists/SpotlistsPage")
);
const SpotlistContent = lazy(() =>
  import("./components/spotlists/SpotlistContent")
);
const SpotDetail = lazy(() => import("./components/spot/SpotDetail"));
const ChatRoom = lazy(() => import("./components/messages/ChatRoom"));
const UserSearch = lazy(() => import("./components/common/UserSearch"));
const Chats = lazy(() => import("./components/messages/Chats"));
const Notifications = lazy(() => import("./components/pages/Notifications"));
const Bookmarks = lazy(() => import("./components/pages/Bookmarks"));
const FriendsPage = lazy(() => import("./components/friends/FriendsPage"));
const FriendsList = lazy(() => import("./components/friends/FriendsList"));
const FriendsRequests = lazy(() =>
  import("./components/friends/FriendsRequests")
);
const Profile = lazy(() => import("./components/profile/Profile"));
const ProfilePosts = lazy(() => import("./components/profile/ProfilePosts"));
const ProfileSpotlists = lazy(() =>
  import("./components/profile/ProfileSpotlists")
);
const Settings = lazy(() => import("./components/pages/Settings"));
const CreateSpot = lazy(() => import("./components/discover/CreateSpot"));
const Reports = lazy(() => import("./components/pages/Reports"));
const NotFoundPage = lazy(() => import("./components/pages/NotFoundPage"));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loader fullscreen" />}>
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

            {/* Spotlists */}
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

            <Route
              path="/:handle/spotlists/:id"
              element={<SpotlistContent />}
            />

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
            <Route
              path="/discover/area-search"
              element={<AreaSearchFilters />}
            />

            <Route path="/discover/area-search/results" element={<Results />} />

            <Route path="/discover/spotlists-hub" element={<SpotlistsHub />} />

            <Route path="/discover/spot-library" element={<SpotLibrary />} />

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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
