import React from "react";
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

export function PlacesAutoComplete({ setLocation }) {
  const {
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 500,
  });

  const handleSelect = async (val) => {
    setValue(val, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: val });
      const { lat, lng } = getLatLng(results[0]);
      setLocation({ lat, lng });
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  return (
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
  );
}
