import React, { useMemo, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertContext } from "../context/AlertContext";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useLoadScript } from "@react-google-maps/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import ConfirmButton from "./components/ConfirmButton";

import { fetchUserLocation, convertCategory } from "../utils/helperFunctions";
import axios from "axios";

export default function SpotAdd() {
  const [spotName, setSpotName] = useState("");
  const [spotOverview, setSpotOverview] = useState("");
  const [spotAddress, setSpotAddress] = useState("");
  const [spotLocation, setSpotLocation] = useState(null);
  const [spotCover, setSpotCover] = useState(false);
  const [spotCategory, setSpotCategory] = useState("Food & Drink");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [visibleMap, setVisibleMap] = useState(false);

  const [addressDetails, setAddressDetails] = useState(null);

  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  const libraries = useMemo(() => ["places"], []);
  const [userLocation, setUserLocation] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_API_KEY,
    libraries,
  });

  useEffect(() => {
    const getUserLocation = async () => {
      const location = await fetchUserLocation();
      if (location) {
        setUserLocation(location);
      } else {
        setUserLocation({ lat: 40.7128, lng: -74.006 });
      }
    };

    getUserLocation();
  }, []);

  const mapOptions = useMemo(
    () => ({
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: "greedy",
      keyboardShortcuts: false,
    }),
    []
  );

  const miniMapOptions = useMemo(
    () => ({
      mapId: "b181cac70f27f5e6",
      disableDefaultUI: true,
      clickableIcons: false,
      gestureHandling: "none",
      draggable: false,
      zoomControl: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false,
    }),
    []
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (spotCover) {
      showAlert("You can upload only one image.", "error");
      return;
    }

    setSpotCover(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCategoryChange = (event) => {
    setSpotCategory(event.target.value);
  };

  const addSpot = async () => {
    try {
      const formData = new FormData();

      let city = null;
      let country = null;

      if (!addressDetails) {
        showAlert("Choose location on the map", "fail");
        return;
      }
      addressDetails.address_components.forEach((component) => {
        if (component.types.includes("locality")) {
          city = component.long_name;
        }
        if (component.types.includes("country")) {
          country = component.long_name;
        }
      });

      const geometry = {
        lat: spotLocation.lat,
        lng: spotLocation.lng,
      };

      formData.append("name", spotName);
      formData.append("overview", spotOverview);
      formData.append("category", convertCategory(spotCategory));
      formData.append("address", spotAddress);
      formData.append("lat", geometry.lat);
      formData.append("lng", geometry.lng);
      formData.append("city", city);
      formData.append("country", country);

      if (spotCover) {
        formData.append("photo", spotCover);
      } else {
        formData.append("photo", "no-img-found.jpg");
      }

      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const res = await axios({
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots`,
        withCredentials: true,
      });
      console.log(res);
      showAlert(res.data.message, res.data.status);
      navigate("/discover");
    } catch (err) {
      console.log(err);
      showAlert(err.response.data.message, err.response.data.status);
    }
  };

  if (!isLoaded || !userLocation) return <div className="loader" />;

  return (
    <APIProvider apiKey={process.env.REACT_APP_API_KEY}>
      <div className="add-spot-container">
        <div className="add-spot-form">
          <div className="add-spot-header">
            <h3>Spot details</h3>
            <p>Provide some information about your spot</p>
          </div>
          <div className="add-spot-body">
            <div>
              <label>Name</label>
              <input
                type="text"
                className="category-box"
                placeholder="Enter spot name"
                value={spotName}
                onChange={(e) => setSpotName(e.target.value)}
              />
            </div>

            <div>
              <label>Overview</label>
              <textarea
                type="text"
                className="category-box-textarea"
                placeholder="Short description about the spot"
                value={spotOverview}
                onChange={(e) => setSpotOverview(e.target.value)}
              />
            </div>
            <div>
              <label>Category</label>
              <select
                value={spotCategory}
                onChange={handleCategoryChange}
                className="category-box"
              >
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
            <div>
              <label>Address</label>
              <input
                type="text"
                value={spotAddress}
                className="category-box"
                placeholder="Choose from the map"
                onClick={() => setVisibleMap(true)}
                readOnly
              />
            </div>
            <div className="mini-map" onClick={() => setVisibleMap(true)}>
              <Map
                defaultZoom={15}
                center={spotLocation || userLocation}
                options={miniMapOptions}
              >
                {spotLocation && <div className="marker" />}
              </Map>
            </div>
            <div className="add-spot-cover">
              <label
                className={`add-spot-cover-label ${spotCover ? "active" : ""}`}
                htmlFor="cover"
              >
                {spotCover ? (
                  "Cover"
                ) : (
                  <>
                    <FontAwesomeIcon icon={faImage} /> Add cover image
                  </>
                )}
              </label>
              <input
                type="file"
                id="cover"
                onChange={handleFileChange}
                accept="image/*"
              />
            </div>
            {spotCover && (
              <div className="add-spot-image-preview">
                <div
                  className="image-preview"
                  style={{ backgroundImage: `url(${photoPreview})` }}
                />
                <button
                  className="delete"
                  onClick={() => {
                    setPhotoPreview(null);
                    setSpotCover(null);
                  }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            )}
            <button className="submit" onClick={addSpot}>
              Submit
            </button>
          </div>
        </div>
        <div className={`add-spot-map ${visibleMap ? "visible" : ""}`}>
          <div className="map">
            <Map
              defaultZoom={15}
              defaultCenter={userLocation}
              options={mapOptions}
            />
          </div>
          <div className="marker" />
          <button className="return" onClick={() => setVisibleMap(false)}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <ConfirmButton
            setVisibleMap={setVisibleMap}
            setSpotAddress={setSpotAddress}
            spotLocation={spotLocation}
            setSpotLocation={setSpotLocation}
            setAddressDetails={setAddressDetails}
          />
        </div>
      </div>
    </APIProvider>
  );
}
