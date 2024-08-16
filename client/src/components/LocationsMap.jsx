import React from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

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
  return (
    <div className="content">
      <div className="block1">
        <button id="getLocationBtn"> Search Places Button </button>
        <div className="results">
          <div className="result"></div>
        </div>
      </div>
      <div id="map">
        <APIProvider apiKey={"AIzaSyBLzOyErw_GGeOYghEGKdDdV8Wyfx7kTpw"}>
          <Map
            keyboardShortcuts={false}
            disableDefaultUI={true}
            defaultZoom={13}
            defaultCenter={{ lat: 51.0918656, lng: 16.9377792 }}
            mapId="65ca8f0d0ef266e"
          ></Map>
        </APIProvider>
      </div>
    </div>
  );
}
