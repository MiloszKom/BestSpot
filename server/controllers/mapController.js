// const AppError = require("./../utils/appError");
const axios = require("axios");

exports.searchNerby = async (req, res) => {
  const { keyword, location, radius } = req.body;

  console.log("Received data from client:", { keyword, location, radius });

  const locationString = `${location.lat},${location.lng}`;
  const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
  const params = {
    keyword: keyword,
    location: locationString,
    radius: radius * 100,
    key: process.env.REACT_APP_API_KEY,
  };

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${url}?${queryString}`;

  try {
    const response = await axios.get(fullUrl);

    console.log("Data received from Google Maps API:", response.data);
    res.status(200).json({
      message: "Data received successfully!",
      googleData: response.data,
    });
  } catch (error) {
    console.error("Error making API request:", error);
    res.status(500).json({
      message: "Failed to retrieve data from Google Maps API",
      error: error.message,
    });
  }
};

exports.getPlaceDetails = async (req, res) => {
  const { id } = req.body;

  console.log("Received data from client:", { id });

  const url = "https://maps.googleapis.com/maps/api/place/details/json";
  const params = {
    place_id: id,
    key: process.env.REACT_APP_API_KEY,
  };

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${url}?${queryString}`;

  try {
    const response = await axios.get(fullUrl);

    console.log("Data received from Google Maps API:", response.data);
    res.status(200).json({
      message: "Data received successfully!",
      googleData: response.data,
    });
  } catch (error) {
    console.error("Error making API request:", error);
    res.status(500).json({
      message: "Failed to retrieve data from Google Maps API",
      error: error.message,
    });
  }
};

exports.getPlacePhotos = async (req, res) => {
  const { maxwidth, photo_reference } = req.body;

  console.log("Received data from client:", { maxwidth, photo_reference });

  const url = "https://maps.googleapis.com/maps/api/place/photo";
  const params = {
    maxwidth: maxwidth,
    photo_reference: photo_reference,
    key: process.env.REACT_APP_API_KEY,
  };

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${url}?${queryString}`;

  try {
    const response = await axios({
      url: fullUrl,
      method: "GET",
      responseType: "arraybuffer",
    });

    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (error) {
    console.error("Error making API request:", error);
    res.status(500).json({
      message: "Failed to retrieve data from Google Maps API",
      error: error.message,
    });
  }
};

exports.getCurrentLocation = async (req, res) => {
  const { lat, lng } = req.body;

  console.log("Received data from client:", { lat, lng });

  const url = "https://maps.googleapis.com/maps/api/geocode/json";
  const params = {
    latlng: `${lat},${lng}`,
    key: process.env.REACT_APP_API_KEY,
  };

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${url}?${queryString}`;

  try {
    const response = await axios.get(fullUrl);

    console.log("Data received from Google Maps API:", response.data);
    res.status(200).json({
      message: "Data received successfully!",
      googleData: response.data,
    });
  } catch (error) {
    console.error("Error making API request:", error);
    res.status(500).json({
      message: "Failed to retrieve data from Google Maps API",
      error: error.message,
    });
  }
};
