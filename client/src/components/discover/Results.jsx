import React, { useState, useMemo, useEffect, useContext } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ResultsContext } from "../context/ResultsContext";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeart,
  faList,
  faMap,
  faPersonWalking,
} from "@fortawesome/free-solid-svg-icons";

import { convertToDisplayName, getZoomLevel } from "../utils/helperFunctions";
import axios from "axios";

import MapMarkers from "./components/MapMarkers";
import MapCircle from "./components/MapCircle";

export default function Results() {
  const [searchParams] = useSearchParams();
  const [location, setLocation] = useState({
    lat: parseFloat(searchParams.get("lat")),
    lng: parseFloat(searchParams.get("lng")),
  });
  const category = searchParams.get("category");
  const radius = searchParams.get("radius");

  const [results, setResults] = useState([]);
  const [mapVisibility, setMapVisibility] = useState(false);
  const [highlightedMarker, setHighlightedMarker] = useState(null);

  const navigate = useNavigate();
  const resultsContext = useContext(ResultsContext);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/maps/areaSearch?category=${category}&lat=${location.lat}&lng=${location.lng}&radius=${radius}`,
          withCredentials: true,
        });
        console.log(res);
        setResults(res.data.data.spots);
        resultsContext.saveResults(res.data.data.spots);
        resultsContext.saveLocation(location);
      } catch (err) {
        console.log(err);
      }
    };
    if (!resultsContext.searchResults) {
      fetchResults();
    } else {
      setResults(resultsContext.searchResults);
      setLocation(resultsContext.location);
    }
  }, []);

  const options = useMemo(
    () => ({
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: "greedy",
    }),
    []
  );

  useEffect(() => {
    setMapVisibility(false);
  }, [highlightedMarker]);

  if (results.length === 0) return <div className="loader" />;

  return (
    <APIProvider apiKey={process.env.REACT_APP_API_KEY}>
      <div className="results-container">
        <div
          className="results-content-wrapper"
          style={{ transform: `translateX(-${mapVisibility ? 100 : 0}%)` }}
        >
          <div className="results-items">
            <div className="results-header">
              <button
                className="return-btn"
                onClick={() => {
                  resultsContext.deleteResults();
                  navigate("/discover/area-search");
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <span>Results ({results.length})</span>
            </div>
            {results.map((result) => {
              const likeCount = result.likes.filter(
                (like) => like.isLikeActive === true
              ).length;
              return (
                <Link
                  to={`/spot/${result._id}`}
                  className={`result-el ${
                    highlightedMarker === result._id ? "highlight" : ""
                  }`}
                  data-id={result.place_id}
                  key={result._id}
                >
                  <div
                    className="image"
                    style={{
                      backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${result.photo})`,
                    }}
                  />
                  <div className="title nowrap-ellipsis">{result.name}</div>
                  <div className="row-2 nowrap-ellipsis">
                    {likeCount}
                    <FontAwesomeIcon icon={faHeart} />
                    {convertToDisplayName(result.category)}
                  </div>
                  <div className="adress nowrap-ellipsis">{result.address}</div>
                  <div>
                    <FontAwesomeIcon icon={faPersonWalking} /> {result.distance}
                    m
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="results-map">
            <Map
              defaultZoom={getZoomLevel(radius)}
              defaultCenter={location}
              options={options}
              mapContainerClassName="map-container2"
            >
              <AdvancedMarker position={location}>
                <div className="current-location"></div>
              </AdvancedMarker>
              <MapCircle location={location} radius={radius} />
              <MapMarkers
                highlightedMarker={highlightedMarker}
                setHighlightedMarker={setHighlightedMarker}
                points={results}
              />
            </Map>
          </div>
        </div>
        <button
          className="switch-btn"
          onClick={() => setMapVisibility((prev) => !prev)}
        >
          {mapVisibility ? (
            <>
              <FontAwesomeIcon icon={faList} /> Show list
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faMap} /> Show map
            </>
          )}
        </button>
      </div>
    </APIProvider>
  );
}
