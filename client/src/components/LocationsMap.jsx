import React from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import darkThemeStyles from "./mapStyles.js";

let userLat;
let userLng;

const getLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      userLat = position.coords.latitude;
      userLng = position.coords.longitude;
    });
  }
};

getLocation();

// Define an SVG for the blue ball marker
const blueBallSVG = `
  <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="white" stroke-width="2" fill="blue" />
  </svg>
`;

const blueBallIcon = "data:image/svg+xml;base64," + btoa(blueBallSVG);

export default function LocationsMap() {
  return (
    <APIProvider apiKey={"AIzaSyBLzOyErw_GGeOYghEGKdDdV8Wyfx7kTpw"}>
      <Map
        id="map"
        keyboardShortcuts={false}
        disableDefaultUI={true}
        defaultZoom={13}
        defaultCenter={{ lat: userLat, lng: userLng }}
        options={{
          styles: darkThemeStyles, // Apply dark mode styles
        }}
      >
        {/* Marker with a custom blue ball icon */}
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
