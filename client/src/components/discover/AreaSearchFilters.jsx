import React, { useState, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertContext } from "../context/AlertContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { APIProvider } from "@vis.gl/react-google-maps";

import { useLoadScript } from "@react-google-maps/api";

import { PlacesAutoComplete } from "./components/PlacesAutoComplete";

import { convertCategory } from "../utils/helperFunctions";
const libraries = ["places"];

export default function AreaSearchFilters() {
  const navigate = useNavigate();
  const { showAlert } = useContext(AlertContext);
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("");
  const [sliderValue, setSliderValue] = useState(50);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_API_KEY,
    libraries,
  });

  const getSliderBackground = useCallback((value) => {
    return `linear-gradient(90deg, #0088ff ${value}%, rgb(214, 214, 214) ${value}%)`;
  }, []);

  const handleSliderChange = (e) => {
    setSliderValue(Number(e.target.value));
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const search = async () => {
    if (!location) {
      showAlert("Pick a starting location", "fail");
      return;
    }
    const categoryValue = convertCategory(category);
    const queryParams = new URLSearchParams({
      category: categoryValue,
      lat: location.lat,
      lng: location.lng,
      radius: sliderValue * 100,
    }).toString();

    navigate(`/discover/area-search/results?${queryParams}`);
  };

  if (!isLoaded) return <div className="loader" />;

  return (
    <APIProvider apiKey={process.env.REACT_APP_API_KEY}>
      <div className="area-search-container">
        <div className="area-search-header">
          <Link to="/discover" className="svg-wrapper">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <span>Area Search</span>
        </div>
        <div className="area-search-body">
          <div className="category">
            <label>Category</label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="category-box"
            >
              <option value="All">All</option>
              <option value="Food & Drink">Food & Drink</option>
              <option value="Nature & Outdoors">Nature & Outdoors</option>
              <option value="Arts & Culture">Arts & Culture</option>
              <option value="Shopping">Shopping</option>
              <option value="Nightlife">Nightlife</option>
              <option value="Relaxation">Relaxation</option>
              <option value="Adventure">Adventure</option>
              <option value="Hidden Gems">Hidden Gems</option>
              <option value="Historical">Historical</option>
              <option value="Photography Spots">Photography Spots</option>
              <option value="Wellness">Wellness</option>
              <option value="Events & Festivals">Events & Festivals</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div className="category">
            <label>Location</label>
            <PlacesAutoComplete setLocation={setLocation} />
          </div>

          <div className="slideContainer">
            <label>Search Radius</label>
            <div className="slider-values">
              <input
                type="range"
                min="0"
                max="100"
                className="slider"
                onChange={handleSliderChange}
                value={sliderValue}
                style={{
                  background: getSliderBackground(sliderValue),
                }}
              />
            </div>
            <div className="slider-values-label">
              <p>0 km</p>
              <p>10 km</p>
            </div>
            <span>Value: {sliderValue / 10} km</span>
          </div>
          <button onClick={search} className="search-spots-btn">
            Search Spots
          </button>
        </div>
      </div>
    </APIProvider>
  );
}
