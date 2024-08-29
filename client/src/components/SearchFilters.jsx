import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { SearchContext } from "./SearchContext";
import axios from "axios";

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
  ComboboxOptionText,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

export default function SearchFilters({ setLocation }) {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (val) => {
    setValue(val, false);
    clearSuggestions();

    const results = await getGeocode({ address: val });
    const { lat, lng } = await getLatLng(results[0]);
    setLocation({ lat, lng });
  };

  return (
    <div className="search-filters">
      <div className="filter-header">
        <Link to="/">
          <i className="fa-solid fa-angle-left"></i>
        </Link>
        <p>Clear Filters</p>
      </div>

      <div className="category">
        <p>Location</p>
        <Combobox onSelect={handleSelect}>
          <ComboboxInput
            className="category-box"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search an adress"
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
    </div>
  );
}
