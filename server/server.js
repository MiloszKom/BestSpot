const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());

app.post("/api/search", async (req, res) => {
  const { keyword, location, radius } = req.body;

  console.log("Received data from client:", { keyword, location, radius });

  const locationString = `${location.lat},${location.lng}`;
  const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
  const params = {
    keyword: keyword,
    location: locationString,
    radius: radius * 100,
    key: process.env.React_App_Api_Key,
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
});

app.post("/api/search2", async (req, res) => {
  const { placeId } = req.body;

  console.log("Received data from client:", { placeId });

  const url = "https://maps.googleapis.com/maps/api/place/details/json";
  const params = {
    place_id: placeId,
    key: process.env.React_App_Api_Key,
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
});

app.post("/api/search3", async (req, res) => {
  const { maxwidth, photo_reference } = req.body;

  console.log("Received data from client:", { maxwidth, photo_reference });

  const url = "https://maps.googleapis.com/maps/api/place/photo";
  const params = {
    maxwidth: maxwidth,
    photo_reference: photo_reference,
    key: process.env.React_App_Api_Key,
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
});

app.post("/api/search4", async (req, res) => {
  const { lat, lng } = req.body;

  console.log("Received data from client:", { lat, lng });

  const url = "https://maps.googleapis.com/maps/api/geocode/json";
  const params = {
    latlng: `${lat},${lng}`,
    key: process.env.React_App_Api_Key,
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
});

const port = 5000;

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
