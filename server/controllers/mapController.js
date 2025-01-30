// const AppError = require("./../utils/appError");
const axios = require("axios");
const Spot = require("../models/spotModel");
const catchAsync = require("../utils/catchAsync");

function measureDistance(position1, position2) {
  const R = 6378137;
  const φ1 = (position1.lat * Math.PI) / 180;
  const φ2 = (position2.lat * Math.PI) / 180;
  const Δφ = ((position2.lat - position1.lat) * Math.PI) / 180;
  const Δλ = ((position2.lng - position1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;

  return Math.round(d * 100) / 100;
}

exports.getLocation = async (req, res) => {
  const lat = req.params.lat;
  const lng = req.params.lng;

  const url = "https://maps.googleapis.com/maps/api/geocode/json";
  const params = {
    latlng: `${lat},${lng}`,
    key: process.env.REACT_APP_API_KEY,
  };

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${url}?${queryString}`;

  try {
    const response = await axios.get(fullUrl);

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

exports.areaSearch = catchAsync(async (req, res) => {
  const { category, lat, lng, radius } = req.query;

  const maxDistance = parseFloat(radius);
  const startPoint = {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
  };

  const spots = await Spot.find();

  const filteredSpots = spots
    .map((spot) => {
      const distance = measureDistance(startPoint, spot.geometry);

      const roundedDistance = Math.round(distance);

      return {
        ...spot.toObject(),
        distance: roundedDistance,
      };
    })
    .filter((spot) => {
      const withinRange = spot.distance <= maxDistance;
      const matchesCategory = category === "all" || spot.category === category;
      return withinRange && matchesCategory;
    });

  filteredSpots.sort((a, b) => {
    if (a.likes.length !== b.likes.length) {
      return b.likes.length - a.likes.length;
    } else {
      return a.distance - b.distance;
    }
  });

  const limitedSpots = filteredSpots.slice(0, 20);

  res.status(200).json({
    message: "Data received successfully!",
    data: {
      spots: limitedSpots,
    },
  });
});
