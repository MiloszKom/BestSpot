import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom"; // Import Navigate

import Navbar from "./components/Navbar";
import LocationsMap from "./components/LocationsMap";
import Login from "./components/Login";
import Signup from "./components/Signup";

function Layout() {
  return (
    <div className="container">
      <Outlet />
      <Navbar />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/search" />} />
        <Route path="/" element={<Layout />}>
          <Route path="search" element={<LocationsMap />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
