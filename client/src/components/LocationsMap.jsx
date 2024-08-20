import React, { useState, useEffect } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { darkThemeStyles, blueBallIcon } from "./mapStyles.js";

export default function LocationsMap() {
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLat(position.coords.latitude);
            setUserLng(position.coords.longitude);
          },
          (error) => {
            console.error("Error getting location:", error);
            setFallbackLocation();
          }
        );
      } else {
        setFallbackLocation();
      }
    };

    const setFallbackLocation = () => {
      setUserLat(51.1027203);
      setUserLng(16.9439538);
    };

    getLocation();
  }, []);

  if (userLat === null || userLng === null) {
    return <div>Loading map...</div>;
  }

  return (
    <APIProvider apiKey={"AIzaSyBLzOyErw_GGeOYghEGKdDdV8Wyfx7kTpw"}>
      <Map
        id="map"
        keyboardShortcuts={false}
        disableDefaultUI={true}
        defaultZoom={13}
        defaultCenter={{ lat: userLat, lng: userLng }}
        options={{
          styles: darkThemeStyles,
        }}
      >
        <Marker
          position={{ lat: userLat, lng: userLng }}
          icon={{
            url: blueBallIcon,
          }}
        />
      </Map>
    </APIProvider>
  );
}
