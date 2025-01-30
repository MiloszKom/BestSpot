import React, { useState, useEffect, useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faHeart } from "@fortawesome/free-solid-svg-icons";

import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";

import { MarkerClusterer } from "@googlemaps/markerclusterer";

export default function Markers({
  highlightedMarker,
  setHighlightedMarker,
  points,
}) {
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
    map.setZoom(15.01);
    setHighlightedMarker(place_id);

    const elements = document.querySelectorAll(".result-el");
    let targetElement = null;

    setTimeout(() => {
      elements.forEach((element) => {
        if (element.classList.contains("highlight")) {
          targetElement = element;
        }
      });

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 200);

    setTimeout(() => {
      map.setZoom(15);
      map.setCenter(position);
    }, 100);
  };

  return points.map((result) => {
    const likeCount = result.likes.filter(
      (like) => like.isLikeActive === true
    ).length;

    return (
      <AdvancedMarker
        key={result._id}
        position={result.geometry}
        ref={(marker) => setMarkerRef(marker, result._id)}
        onClick={() => zoomMarker(result._id, result.geometry)}
      >
        <div className="custom-marker-wrapper">
          <div>
            <div
              className={`custom-marker ${
                highlightedMarker === result._id ? "highlighted-marker" : ""
              }`}
            >
              {likeCount} <FontAwesomeIcon icon={faHeart} />
            </div>
          </div>
          <div className="custom-marker-label">{result.name}</div>
        </div>
      </AdvancedMarker>
    );
  });
}
