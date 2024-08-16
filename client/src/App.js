import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LocationsMap from "./components/LocationsMap";

function App() {
  return (
    <div className="container">
      <Header />
      <LocationsMap />
      <Footer />
    </div>
  );
}

export default App;
