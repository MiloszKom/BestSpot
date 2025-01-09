import React, { useState, useMemo, useRef, useEffect, useContext } from "react";
import { ResultsContext } from "../context/ResultsContext.jsx";

import { useLoadScript } from "@react-google-maps/api";

import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";

import { MarkerClusterer } from "@googlemaps/markerclusterer";

import SearchFilters from "./SearchFilters.jsx";
import SearchBar from "./SearchBar.jsx";
import MapResults from "./MapResults.jsx";

const libraries = ["places"];

export default function GoogleMap() {
  const [location, setLocation] = useState("");
  const [sliderValue, setSliderValue] = useState(15);
  const [spotValue, setSpotValue] = useState("Restaurant");
  const center = useMemo(() => ({ lat: 51.103574, lng: 16.943842 }), []);
  const options = useMemo(
    () => ({
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: "greedy",
    }),
    []
  );

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_API_KEY,
    libraries,
  });

  const results = useContext(ResultsContext);

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

    fetch("/api/v1/maps/searchNerby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Success:", result.googleData.results);
        results.getResults(result.googleData.results);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const [highlightedMarker, setHighlightedMarker] = useState(null);

  const Markers = ({ points }) => {
    const map = useMap();
    const [markers, setMarkers] = useState({});
    const clusterer = useRef(null);

    useEffect(() => {
      if (!map) return;

      if (!clusterer.current) {
        clusterer.current = new MarkerClusterer({ map });
      }

      return () => {
        if (clusterer.current) {
          clusterer.current.clearMarkers();
        }
      };
    }, [map]);

    useEffect(() => {
      if (clusterer.current && markers && Object.keys(markers).length > 0) {
        clusterer.current.clearMarkers();
        clusterer.current.addMarkers(Object.values(markers));
      }
    }, [markers]);

    useEffect(() => {
      if (!points || points.length === 0) {
        if (clusterer.current) {
          clusterer.current.clearMarkers();
        }
      }
    }, [points]);

    const setMarkerRef = (marker, key) => {
      if (marker && markers[key]) return;
      if (!marker && !markers[key]) return;

      setMarkers((prev) => {
        if (marker) {
          return { ...prev, [key]: marker };
        } else {
          const newMarkers = { ...prev };
          delete newMarkers[key];
          return newMarkers;
        }
      });
    };

    const zoomMarker = (place_id, position) => {
      map.setZoom(16.99);
      setHighlightedMarker(place_id);

      const element = document.querySelector(`[data-id=${place_id}]`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setTimeout(() => {
        map.setZoom(17);
        map.setCenter(position);
      }, 100);
    };

    return points.map((result) => (
      <AdvancedMarker
        key={result.place_id}
        position={result.geometry.location}
        ref={(marker) => setMarkerRef(marker, result.place_id)}
        onClick={() => zoomMarker(result.place_id, result.geometry.location)}
      >
        <div className="custom-marker-wrapper">
          <div className="test">
            <div
              className={`custom-marker ${
                highlightedMarker === result.place_id
                  ? "highlighted-marker"
                  : ""
              }`}
            >
              {result.rating} ({result.user_ratings_total})
            </div>
          </div>
          <div className="custom-marker-label">{result.name}</div>
        </div>
      </AdvancedMarker>
    ));
  };

  if (!isLoaded) return <div className="loader"></div>;
  return (
    <APIProvider apiKey={process.env.React_App_Api_Key}>
      <div className="map-container">
        {!results.searchResults && <SearchBar />}
        <div className="map">
          <Map
            defaultZoom={10}
            defaultCenter={center}
            options={options}
            mapContainerClassName="map-container2"
          >
            {location && (
              <>
                {/* <Circle center={location} radius={sliderValue * 100} /> */}
                <AdvancedMarker position={location}>
                  <div className="current-location"></div>
                </AdvancedMarker>
              </>
            )}
            {results.searchResults && (
              <Markers points={results.searchResults} />
            )}
          </Map>
        </div>
        {results.searchResults && (
          <MapResults
            points={results.searchResults}
            location={location}
            highlightedMarker={highlightedMarker}
          />
        )}
        <SearchFilters
          location={location}
          setLocation={setLocation}
          sliderValue={sliderValue}
          setSliderValue={setSliderValue}
          spotValue={spotValue}
          setSpotValue={setSpotValue}
          handleSearch={handleSearch}
          searchResults={results.searchResults}
        />
      </div>
    </APIProvider>
  );
}
