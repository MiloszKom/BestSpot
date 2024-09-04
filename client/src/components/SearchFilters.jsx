import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";

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
  setLocation,
  sliderValue,
  setSliderValue,
  spotValue,
  setSpotValue,
  handleSearch,
}) {
  const [sliderBackground, setSliderBackground] = useState("");

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  useEffect(() => {
    const x = sliderValue;
    const color = `linear-gradient(90deg, #0088ff ${x}%, rgb(214, 214, 214) ${x}%)`;
    setSliderBackground(color);
  }, [sliderValue]); // Update the background gradient when sliderValue changes

  const handleSelect = async (val) => {
    setValue(val, false);
    clearSuggestions();

    const results = await getGeocode({ address: val });
    const { lat, lng } = await getLatLng(results[0]);
    setLocation({ lat, lng });
  };

  const handleClick = () => {
    const searchFilters = document.querySelector(".search-filters");
    if (searchFilters) {
      searchFilters.style.marginTop = "0dvh";
    }
  };

  const handleSliderChange = (e) => {
    setSliderValue(Number(e.target.value));
  };

  return (
    <div className="search-filters">
      <div className="filter-header">
        <FontAwesomeIcon
          icon={faAngleLeft}
          className="icon"
          onClick={handleClick}
        />
        <p>Clear Filters</p>
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
      <button className="search-spots-btn" onClick={handleSearch}>
        Search Spots
      </button>
    </div>
  );
}
