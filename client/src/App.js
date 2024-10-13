import React, { useState, useCallback, useEffect, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./components/AuthContext";
import { ResultsContext } from "./components/ResultsContext";

import { checkCookies } from "./components/helperFunctions";

import Navbar from "./components/Navbar";
import LocationsMap from "./components/LocationsMap";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Account from "./components/Account";
import Settings from "./components/Settings";
import Favourites from "./components/Favourites";
import SpotDetail from "./components/SpotDetail";

function Layout({ showNavbar }) {
  return (
    <div className="container">
      <Outlet />
      {showNavbar && <Navbar />}
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showNavbar, setShowNavbar] = useState(true);

  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const fetchCookies = async () => {
      const result = await checkCookies();
      if (result) {
        setIsLoggedIn(true);
        setUserData(result.user);
      }
    };
    fetchCookies();
  }, []);

  const login = useCallback((data) => {
    setIsLoggedIn(true);
    setUserData(data.data.user);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserData(null);
  }, []);

  const getResults = useCallback((data) => {
    setSearchResults(data);
  }, []);

  const deleteResults = useCallback(() => {
    setSearchResults(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, userData }}>
      <ResultsContext.Provider
        value={{ searchResults, getResults, deleteResults }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout showNavbar={showNavbar} />}>
              <Route index element={<Navigate to="/search" replace />} />

              <Route
                path="search"
                element={<LocationsMap setShowNavbar={setShowNavbar} />}
              />
              {/* <Route path="favourites">
              <Route index element={<Favourites />} />
              <Route
                path=":id"
                element={<SpotDetail setShowNavbar={setShowNavbar} />}
              />
            </Route> */}
              <Route path="favourites" element={<Favourites />} />
              <Route
                path="favourites/:id"
                element={<SpotDetail setShowNavbar={setShowNavbar} />}
              />

              <Route
                path="search/:id"
                element={<SpotDetail setShowNavbar={setShowNavbar} />}
              />

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
  );
}

export default App;
