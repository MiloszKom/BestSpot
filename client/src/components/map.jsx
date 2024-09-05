import { useState, useMemo, useCallback, useRef } from "react";
import { GoogleMap, Marker, Circle } from "@react-google-maps/api";

import SearchFilters from "./SearchFilters";
import Spots from "./Spots";
import SearchBar from "./SearchBar";
import { blueBallIcon } from "./mapStyles.js";

export default function Map({ isLoaded }) {
  const [location, setLocation] = useState();
  const [sliderValue, setSliderValue] = useState(0);
  const [spotValue, setSpotValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const mapRef = useRef();
  const center = useMemo(() => ({ lat: 51.103574, lng: 16.943842 }), []);
  const options = useMemo(
    () => ({
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );
  const onLoad = useCallback((map) => (mapRef.current = map), []);

  const handleSearch = () => {
    const data = {
      keyword: spotValue,
      location: {
        lat: location.lat,
        lng: location.lng,
      },
      radius: sliderValue,
    };

    const searchFilters = document.querySelector(".search-filters");
    if (searchFilters) {
      searchFilters.style.marginTop = "0dvh";
    }

    fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Success:", result.googleData.results);
        setSearchResults(result.googleData.results);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <>
      <div className="container">
        <SearchBar />
        {isLoaded}
        <div className="map">
          <GoogleMap
            zoom={10}
            center={center}
            options={options}
            mapContainerClassName="map-container2"
            onLoad={onLoad}
          >
            {location && (
              <>
                <Marker
                  position={location}
                  icon={{
                    url: blueBallIcon,
                  }}
                />
                <Circle center={location} radius={sliderValue * 100}></Circle>
              </>
            )}

            {searchResults &&
              searchResults.map((result) => (
                <Marker
                  key={result.place_id}
                  position={result.geometry.location}
                  label={{
                    text: `${result.name} (${result.rating})`,
                    color: "#00aaff",
                    fontWeight: "bold",
                    fontSize: "0.7rem",
                  }}
                  icon={{
                    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                    labelOrigin: new window.google.maps.Point(17, 40), // Adjust x and y values
                  }}
                />
              ))}
          </GoogleMap>
        </div>
        <Spots />
      </div>
      <SearchFilters
        setLocation={(position) => {
          setLocation(position);
          mapRef.current?.panTo(position);
        }}
        sliderValue={sliderValue}
        setSliderValue={setSliderValue}
        spotValue={spotValue}
        setSpotValue={setSpotValue}
        handleSearch={handleSearch}
      />
    </>
  );
}
