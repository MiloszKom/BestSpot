import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMap } from "@vis.gl/react-google-maps";

import axios from "axios";
import React, { useContext } from "react";

import { AlertContext } from "../../context/AlertContext";

export default function ConfirmButton({
  setVisibleMap,
  setSpotAddress,
  spotLocation,
  setSpotLocation,
  setAddressDetails,
}) {
  const map = useMap();
  const { showAlert } = useContext(AlertContext);

  const getLatLng = async () => {
    const center = map.getCenter();
    const lat = center.lat().toFixed(6);
    const lng = center.lng().toFixed(6);

    try {
      const res = await axios({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/maps/getLocation/${lat}/${lng}`,
        withCredentials: true,
      });

      const results = res.data.googleData.results;

      const locationData =
        results[0].types && results[0].types.includes("plus_code")
          ? results[1]
          : results[0];

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
      setVisibleMap(false);
    } catch (err) {
      setVisibleMap(false);
      console.log(err);
    }
  };

  return (
    <button className="confirm" onClick={getLatLng}>
      <FontAwesomeIcon icon={faCheck} /> Confirm
    </button>
  );
}
