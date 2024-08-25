import React, { useState, useEffect, useContext } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { darkThemeStyles, blueBallIcon } from "./mapStyles.js";
import { SearchContext } from "./SearchContext";

export default function LocationsMap() {
  const { userLat, setUserLat, userLng, setUserLng, results, setResults } =
    useContext(SearchContext);

  const [mapMarkers, setMapMarkers] = useState([]);

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
  }, [setUserLat, setUserLng]);

  useEffect(() => {
    console.log(results);
    if (results) {
      results.forEach((result) => {
        console.log(result);
      });
      const newMarkers = results.map((result) => (
        <Marker key={result} position={result.geometry.location} />
      ));
      console.log(newMarkers);
      setMapMarkers(newMarkers);
    }
  }, [results]);

  if (userLat === null || userLng === null) {
    return <div>Loading map...</div>;
  }

  return (
    <APIProvider apiKey={process.env.React_App_Api_Key}>
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
        {mapMarkers}
      </Map>
    </APIProvider>
  );
}
