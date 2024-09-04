import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";

import SearchFilters from "./SearchFilters";
import Spots from "./Spots";
import SearchBar from "./SearchBar";
import { blueBallIcon } from "./mapStyles.js";
// import Distance from "./distance";

export default function Map({ isLoaded }) {
  const [location, setLocation] = useState();
  const [sliderValue, setSliderValue] = useState(1);
  const [spotValue, setSpotValue] = useState("");

  const mapRef = useRef();
  const center = useMemo(() => ({ lat: 43, lng: -80 }), []);
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

    fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Success:", result);
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
