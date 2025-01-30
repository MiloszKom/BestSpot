import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { useMap } from "@vis.gl/react-google-maps";

import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

export default function SearchFilters({
  location,
  setLocation,
  sliderValue,
  setSliderValue,
  spotValue,
  setSpotValue,
  handleSearch,
  searchResults,
}) {
  const [sliderBackground, setSliderBackground] = useState("");

  const {
    // ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  useEffect(() => {
    const x = sliderValue;
    const color = `linear-gradient(90deg, #0088ff ${x}%, rgb(214, 214, 214) ${x}%)`;
    setSliderBackground(color);
  }, [sliderValue]);

  const AdjustZoom = () => {
    map.setZoom(15 - sliderValue / 20);
  };

  const handleSelect = async (val) => {
    if (isChecked) return;
    setValue(val, false);
    clearSuggestions();

    const results = await getGeocode({ address: val });
    const { lat, lng } = getLatLng(results[0]);
    setLocation({ lat, lng });

    if (map) {
      map.panTo({ lat, lng });
    }
  };

  const searchFadeAway = () => {
    const searchFilters = document.querySelector(".search-filters");
    if (searchFilters) {
      searchFilters.style.opacity = "0";
      searchFilters.style.transform = "translateY(-100%)";
    }
  };

  const handleSliderChange = (e) => {
    setSliderValue(Number(e.target.value));
  };

  const map = useMap();
  if (map) {
    const center = map.getCenter(); // This returns a LatLng object
    const lat = center.lat(); // Call the lat() method
    const lng = center.lng(); // Call the lng() method
    console.log(`Latitude: ${lat}, Longitude: ${lng}`);
  }

  const clearFilters = () => {
    setSpotValue("");
    setValue("");
    setSliderValue(15);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (location.lat === lat && location.lng === lng) return;
          setLocation({ lat, lng });
          setValue("Searching adress...");

          if (map) {
            map.panTo({ lat, lng });
          }

          const data = {
            lat: lat,
            lng: lng,
          };

          fetch("/api/v1/maps/getCurrentLocation", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          })
            .then((response) => response.json())
            .then((result) => {
              console.log("Success:", result.googleData.results[0]);
              setValue(result.googleData.results[0].formatted_address);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Bandaid scrollIntoView in searchResults fix

  const [isChecked, setIsChecked] = useState(false);

  const handleLocationChange = (e) => {
    setIsChecked(e.target.checked);

    if (e.target.checked) {
      getCurrentLocation();
    }
  };

  return (
    <div className="search-filters">
      <div className="filter-header">
        <FontAwesomeIcon
          icon={faAngleLeft}
          className="icon"
          onClick={searchFadeAway}
        />
        <p onClick={clearFilters}>Clear Filters</p>
      </div>

      <div className="category">
        <p>Keywords</p>
        <input
          className="category-box"
          placeholder="Eg. Tourist attraction, chineese restaurant"
          value={spotValue}
          onChange={(e) => setSpotValue(e.target.value)}
        />
      </div>

      <div className="category">
        <p>Location</p>
        <Combobox onSelect={handleSelect}>
          <ComboboxInput
            className="category-box"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search an address"
          />
          <ComboboxPopover>
            <ComboboxList>
              {status === "OK" &&
                data.map(({ place_id, description }) => (
                  <ComboboxOption key={place_id} value={description} />
                ))}
            </ComboboxList>
          </ComboboxPopover>
        </Combobox>
        <div className="get-current-location">
          <p>Use your current location</p>
          <input
            type="checkbox"
            id="check"
            checked={isChecked}
            onChange={handleLocationChange}
          />
          <label htmlFor="check" className="button"></label>
        </div>
      </div>

      <div className="slideContainer">
        <p>Search Radius</p>
        <div className="slider-values">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseUp={AdjustZoom}
            onTouchEnd={AdjustZoom}
            className="slider"
            style={{ background: sliderBackground }}
          />
        </div>
        <div className="slider-values-label">
          <p>0 km</p>
          <p>10 km</p>
        </div>
        <p>
          Value: <span>{sliderValue / 10} km</span>
        </p>
      </div>
      <button
        className="search-spots-btn"
        onClick={() => {
          handleSearch();
          searchFadeAway();
        }}
      >
        Search Spots
      </button>
    </div>
  );
}
