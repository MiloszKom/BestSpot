const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());

app.post("/api/search", async (req, res) => {
  const { keyword, location, radius } = req.body; // Destructure the data from the request body

  console.log("Received data from client:", { keyword, location, radius }); // Log the received data

  const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
  const params = {
    keyword: keyword,
    location: location,
    radius: radius,
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
