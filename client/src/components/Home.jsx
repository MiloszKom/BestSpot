import React, { Link } from "react";
import LocationsMap from "./LocationsMap";
import SearchBar from "./SearchBar";
import Spots from "./Spots";

export default function Home() {
  return (
    <div className="container">
      <SearchBar />
      <LocationsMap />
      <Spots />
    </div>
  );
}
