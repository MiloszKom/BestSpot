import React, { useMemo, useState, useContext, useEffect } from "react";
import { AlertContext } from "../context/AlertContext";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useLoadScript } from "@react-google-maps/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash } from "@fortawesome/free-solid-svg-icons";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import ConfirmButton from "./components/ConfirmButton";
import Spinner from "../common/Spinner";

import { fetchUserLocation, convertCategory } from "../utils/helperFunctions";
import { useSpotMutations } from "../hooks/useSpotMutations";

import * as nsfwjs from "nsfwjs";
import { useValidateUserContent } from "../hooks/useValidateUserContent";

export default function CreateSpotPage() {
  const [spotName, setSpotName] = useState("");
  const [spotOverview, setSpotOverview] = useState("");
  const [spotAddress, setSpotAddress] = useState("");
  const [spotLocation, setSpotLocation] = useState(null);
  const [spotCover, setSpotCover] = useState(false);
  const [spotCategory, setSpotCategory] = useState("Food & Drink");
  const [photoPreview, setPhotoPreview] = useState(null);
  const [visibleMap, setVisibleMap] = useState(false);
  const [model, setModel] = useState(null);

  const [addressDetails, setAddressDetails] = useState(null);

  const { showAlert } = useContext(AlertContext);

  const libraries = useMemo(() => ["places"], []);
  const [userLocation, setUserLocation] = useState(null);

  const { textValidator, imageValidator } = useValidateUserContent();

  useEffect(() => {
    nsfwjs.load().then((loadedModel) => {
      setModel(loadedModel);
    });
  }, []);

  const { createSpotMutation } = useSpotMutations();

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

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (files.length > 1) {
      showAlert("Upload only 1 image", "fail");
      return;
    }

    const file = files[0];

    const isSafe = await imageValidator(file, model);

    if (!isSafe) return;

    setSpotCover(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleCategoryChange = (event) => {
    setSpotCategory(event.target.value);
  };

  const addSpot = async () => {
    const formData = new FormData();

    let city = "Unknown Location";
    let country = "Unknown Country";

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

    if (!textValidator([spotName, spotOverview])) return;

    if (spotCover) {
      formData.append("photo", spotCover);
    }
    createSpotMutation.mutate(formData);
  };

  if (!isLoaded || !userLocation) return <div className="loader" />;

  return (
    <APIProvider apiKey={process.env.REACT_APP_API_KEY}>
      <div className="create-spot-container">
        <div className="create-spot-form">
          <div className="create-spot-header">Create Spot</div>
          <div className="create-spot-body">
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
            <div className="create-spot-cover">
              <label
                className={`create-spot-cover-label ${
                  spotCover ? "active" : ""
                }`}
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
              <div className="create-spot-image-preview">
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
            <button
              className={`create-spot-btn ${
                createSpotMutation.isPending ? "disabled" : ""
              }`}
              onClick={addSpot}
              disabled={createSpotMutation.isPending}
            >
              {createSpotMutation.isPending ? <Spinner /> : "Create"}
            </button>
          </div>
        </div>
        <div className={`create-spot-map ${visibleMap ? "visible" : ""}`}>
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
            setSpotLocation={setSpotLocation}
            setAddressDetails={setAddressDetails}
          />
        </div>
      </div>
    </APIProvider>
  );
}
