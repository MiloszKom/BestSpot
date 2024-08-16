import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { APIProvider, Map } from "@vis.gl/react-google-maps";

function gotLocation(position) {
  console.log(position);
}

function failedToGetLoaction() {
  console.log("There was an isstue");
}

navigator.geolocation.getCurrentPosition(gotLocation, failedToGetLoaction);

function App() {
  return (
    <div className="container">
      <Header />
      <div className="content">
        <div className="block1"></div>
        <div id="map">
          <APIProvider apiKey={"AIzaSyBLzOyErw_GGeOYghEGKdDdV8Wyfx7kTpw"}>
            <Map
              keyboardShortcuts={false}
              disableDefaultUI={true}
              defaultZoom={14}
              defaultCenter={{ lat: 51.0918656, lng: 16.9377792 }}
              mapId="DEMO_MAP_ID"
            ></Map>
          </APIProvider>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
