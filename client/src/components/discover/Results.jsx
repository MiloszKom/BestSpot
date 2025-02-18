import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faHeart,
  faList,
  faMagnifyingGlass,
  faMap,
  faPersonWalking,
} from "@fortawesome/free-solid-svg-icons";

import { convertToDisplayName, getZoomLevel } from "../utils/helperFunctions";
import { getAreaSearchResults } from "../api/discoveryApis";

import MapMarkers from "./components/MapMarkers";
import MapCircle from "./components/MapCircle";
import ErrorPage from "../pages/ErrorPage";

export default function Results() {
  const [searchParams] = useSearchParams();
  const location = {
    lat: parseFloat(searchParams.get("lat")),
    lng: parseFloat(searchParams.get("lng")),
  };
  const category = searchParams.get("category");
  const radius = searchParams.get("radius");

  const [mapVisibility, setMapVisibility] = useState(false);
  const [highlightedMarker, setHighlightedMarker] = useState(null);

  const navigate = useNavigate();

  const {
    data: results = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["results", location, category, radius],
    queryFn: () =>
      getAreaSearchResults({
        category,
        lat: location.lat,
        lng: location.lng,
        radius,
      }),
  });

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

  if (isLoading) return <div className="loader big" />;

  if (isError) return <ErrorPage error={error} />;

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
                  navigate("/discover/area-search");
                }}
              >
                <FontAwesomeIcon icon={faArrowLeft} />
              </button>
              <span>Results ({results.length})</span>
            </div>
            {results.length > 0 ? (
              <div className="results-body">
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
                        aria-label={`Image of ${result.name}`}
                      />
                      <div className="title nowrap-ellipsis">{result.name}</div>
                      <div className="row-2 nowrap-ellipsis">
                        {likeCount}
                        <FontAwesomeIcon icon={faHeart} />
                        {convertToDisplayName(result.category) ||
                          "Unknown Category"}
                      </div>
                      <div className="adress nowrap-ellipsis">
                        {result.address}
                      </div>
                      <div>
                        <FontAwesomeIcon icon={faPersonWalking} />{" "}
                        {result.distance}m
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="results-empty-container">
                <div className="results-empty-content">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                  <div className="results-empty-main-msg">No results found</div>
                  <div className="results-empty-secondary-msg">
                    Be the first to add a spot in this area
                  </div>
                  <Link to="/create-spot" className="home-button ">
                    Create Spot
                  </Link>
                </div>
              </div>
            )}
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
