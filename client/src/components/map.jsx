import { useState, useMemo, useRef, useEffect } from "react";
// import { Circle } from "@react-google-maps/api";

import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";

import { MarkerClusterer } from "@googlemaps/markerclusterer";

import SearchFilters from "./SearchFilters";
import Navbar from "./Navbar.jsx";
import SearchBar from "./SearchBar";
import MapResults from "./MapResults.jsx";
import SpotDetail from "./SpotDetail.jsx";
// import { blueBallIcon } from "./mapStyles.js";

export default function GoogleMap() {
  const [location, setLocation] = useState("");
  const [sliderValue, setSliderValue] = useState(15);
  const [spotValue, setSpotValue] = useState("Restaurant");
  const [searchResults, setSearchResults] = useState();
  const [placeDetails, setPlaceDetails] = useState(null);
  const [placePhotos, setPlacePhotos] = useState([]);
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

  const moreDetails = (id) => {
    const data = {
      placeId: id,
    };

    fetch("/api/search2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("Success:", result.googleData.result);
        setPlaceDetails(result.googleData.result);

        const photos = result.googleData.result.photos || [];
        const fetchPhotoPromises = photos.slice(0, 3).map((photo) => {
          const photoData = {
            maxwidth: photo.width,
            photo_reference: photo.photo_reference,
          };

          return fetch("/api/search3", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(photoData),
          })
            .then((response) => response.blob())
            .then((blob) => {
              const imageUrl = URL.createObjectURL(blob);
              return imageUrl;
            })
            .catch((error) => {
              console.error("Error fetching photo:", error);
              return null;
            });
        });

        Promise.all(fetchPhotoPromises)
          .then((photoUrls) => {
            setPlacePhotos((prevPhotos) => [
              ...prevPhotos,
              ...photoUrls.filter((url) => url !== null),
            ]);
          })
          .catch((error) => {
            console.error("Error processing photo URLs:", error);
          });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const lessDetails = () => {
    setPlaceDetails(null);
    setPlacePhotos([]);
  };

  return (
    <APIProvider apiKey={process.env.React_App_Api_Key}>
      <div className="map-container">
        {!searchResults && <SearchBar />}
        {!placeDetails && (
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
              {searchResults && <Markers points={searchResults} />}
            </Map>
          </div>
        )}
        {searchResults && !placeDetails && (
          <MapResults
            points={searchResults}
            setSearchResults={setSearchResults}
            moreDetails={moreDetails}
            location={location}
            highlightedMarker={highlightedMarker}
          />
        )}
        {placeDetails && (
          <SpotDetail
            placeDetails={placeDetails}
            placePhotos={placePhotos}
            lessDetails={lessDetails}
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
          searchResults={searchResults}
        />
      </div>
    </APIProvider>
  );
}
