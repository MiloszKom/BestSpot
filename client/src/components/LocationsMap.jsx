import React from "react";
import { useEffect, useState } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      let lat = position.coords.latitude;
      let lng = position.coords.longitude;

      console.log(lat, lng);
    });
  }
};

getLocation();

export default function LocationsMap() {
  const [backendData, setBackendData] = useState([{}]);

  useEffect(() => {
    fetch("/api/v1/places")
      .then((response) => response.json())
      .then((data) => {
        setBackendData(data.results);
      });
  }, []);

  return (
    <APIProvider apiKey={"AIzaSyBLzOyErw_GGeOYghEGKdDdV8Wyfx7kTpw"}>
      <Map
        id="map"
        keyboardShortcuts={false}
        disableDefaultUI={true}
        defaultZoom={13}
        defaultCenter={{ lat: 51.0443583, lng: 16.8675189 }}
        mapId="65ca8f0d0ef266e"
      ></Map>
    </APIProvider>
  );
}
