const axios = require("axios");
const Spot = require("../models/spotModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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

exports.getLocation = catchAsync(async (req, res) => {
  const lat = req.params.lat;
  const lng = req.params.lng;

  const url = "https://maps.googleapis.com/maps/api/geocode/json";
  const params = {
    latlng: `${lat},${lng}`,
    key: process.env.REACT_APP_API_KEY,
  };

  const queryString = new URLSearchParams(params).toString();
  const fullUrl = `${url}?${queryString}`;

  const response = await axios.get(fullUrl);

  res.status(200).json({
    message: "Data received successfully!",
    googleData: response.data,
  });
});

exports.areaSearch = catchAsync(async (req, res, next) => {
  const { category, lat, lng, radius } = req.query;

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  let parsedRadius = parseFloat(radius);

  if (
    isNaN(parsedLat) ||
    parsedLat < -90 ||
    parsedLat > 90 ||
    isNaN(parsedLng) ||
    parsedLng < -180 ||
    parsedLng > 180 ||
    isNaN(parsedRadius) ||
    parsedRadius < 0
  ) {
    return next(new AppError("Invalid query parameters", 400));
  }

  parsedRadius = Math.min(parsedRadius, 10000);

  const startPoint = { lat: parsedLat, lng: parsedLng };

  const spots = await Spot.find();

  const filteredSpots = spots
    .map((spot) => {
      const distance = measureDistance(startPoint, spot.geometry);
      return { ...spot.toObject(), distance: Math.round(distance) };
    })
    .filter((spot) => {
      const withinRange = spot.distance <= parsedRadius;
      const matchesCategory = category === "all" || spot.category === category;
      return withinRange && matchesCategory;
    });

  filteredSpots.sort((a, b) => {
    if (a.likes.length !== b.likes.length) {
      return b.likes.length - a.likes.length;
    }
    return a.distance - b.distance;
  });

  res.status(200).json({
    message: "Data received successfully!",
    data: { spots: filteredSpots.slice(0, 20) },
  });
});
