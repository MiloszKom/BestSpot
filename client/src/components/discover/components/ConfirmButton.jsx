import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMap } from "@vis.gl/react-google-maps";

import axios from "axios";
import React, { useState, useContext } from "react";

import { AlertContext } from "../../context/AlertContext";
import Spinner from "../../common/Spinner";

export default function ConfirmButton({
  setVisibleMap,
  setSpotAddress,
  spotLocation,
  setSpotLocation,
  setAddressDetails,
}) {
  const map = useMap();
  const { showAlert } = useContext(AlertContext);
  const [isLoading, setIsLoading] = useState(false);

  const getLatLng = async () => {
    const center = map.getCenter();
    const lat = center.lat().toFixed(6);
    const lng = center.lng().toFixed(6);

    try {
      setIsLoading(true);
      const res = await axios({
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        url: `${process.env.REACT_APP_API_URL}/api/v1/maps/getLocation/${lat}/${lng}`,
        withCredentials: true,
      });

      const results = res.data.googleData.results;

      let locationData;

      for (let result of results) {
        if (
          result.types &&
          (result.types.includes("street_address") ||
            result.types.includes("route"))
        ) {
          locationData = result;
          break;
        }
      }

      if (!locationData) {
        showAlert("No valid location data found", "fail");
        setVisibleMap(false);
        return;
      }

      setAddressDetails(locationData);
      setSpotAddress(locationData.formatted_address);
      setSpotLocation({
        lat: locationData.geometry.location.lat,
        lng: locationData.geometry.location.lng,
      });
    } catch (err) {
      if (err.code === "ERR_NETWORK") {
        showAlert("Too many requests. Try again later.", "fail");
      } else {
        showAlert(err.response.data.message, "fail");
      }
    } finally {
      setIsLoading(false);
      setVisibleMap(false);
    }
  };

  return (
    <button className="confirm" onClick={getLatLng} disabled={isLoading}>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <FontAwesomeIcon icon={faCheck} /> Confirm
        </>
      )}
    </button>
  );
}
