import { useState, useMemo, useCallback, useRef } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Circle,
  MarkerClusterer,
} from "@react-google-maps/api";

import SearchFilters from "./SearchFilters";
import { blueBallIcon } from "./mapStyles.js";
// import Distance from "./distance";

export default function Map() {
  const [location, setLocation] = useState();
  const mapRef = useRef();
  const center = useMemo(() => ({ lat: 43, lng: -80 }), []);
  const options = useMemo(
    () => ({
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: true,
      clickableIcons: false,
    }),
    []
  );
  const onLoad = useCallback((map) => (mapRef.current = map), []);

  return (
    <div className="map-container1">
      <div className="controls">
        <SearchFilters
          setLocation={(position) => {
            setLocation(position);
            mapRef.current?.panTo(position);
          }}
        />
      </div>
      <div className="map">
        <GoogleMap
          zoom={10}
          center={center}
          options={options}
          mapContainerClassName="map-container2"
          onLoad={onLoad}
        >
          {location && (
            <>
              <Marker
                position={location}
                icon={{
                  url: blueBallIcon,
                }}
              />
              <Circle center={location} radius={1500}></Circle>
            </>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
