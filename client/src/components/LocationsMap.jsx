import React from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import darkThemeStyles from "./mapStyles.js";

export default function LocationsMap() {
  return (
    <APIProvider apiKey={"AIzaSyBLzOyErw_GGeOYghEGKdDdV8Wyfx7kTpw"}>
      <Map
        id="map"
        keyboardShortcuts={false}
        disableDefaultUI={true}
        defaultZoom={13}
        defaultCenter={{ lat: 51.0443583, lng: 16.8675189 }}
        options={{
          styles: darkThemeStyles, // Apply dark mode styles
        }}
      />
    </APIProvider>
  );
}
