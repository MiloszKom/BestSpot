import React, { Link } from "react";
import LocationsMap from "./LocationsMap";
import SearchBar from "./SearchBar";

export default function Home() {
  return (
    <div className="container">
      <SearchBar />
      <LocationsMap />
    </div>
  );
}
