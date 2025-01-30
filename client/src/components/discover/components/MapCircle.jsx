import React, { useEffect } from "react";

import { useMap, useApiIsLoaded } from "@vis.gl/react-google-maps";

export default function MapChild({ location, radius }) {
  const map = useMap();
  const isApiLoaded = useApiIsLoaded();

  useEffect(() => {
    if (!map || !isApiLoaded || !window.google) return;

    const circle = new window.google.maps.Circle({
      strokeColor: "#0088ff",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillOpacity: 0.2,
      map,
      center: location,
      radius: parseFloat(radius),
    });

    return () => {
      circle.setMap(null);
    };
  }, [map, isApiLoaded, location, radius]);

  return null;
}
