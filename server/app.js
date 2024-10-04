const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const xss = require("xss-clean");
const path = require("path");

app.use(helmet());

app.use(morgan("dev"));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());

require("dotenv").config();

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const favRouter = require("./routes/favRoutes");
const userRouter = require("./routes/userRoutes");

app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3001"],
    credentials: true,
  })
);

// app.use((req, res, next) => {
//   console.log(req.cookies);
//   next();
// });

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use("/api/v1/favourites", favRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

module.exports = app;

//   app.post("/api/search", async (req, res) => {
//   const { keyword, location, radius } = req.body;

//   console.log("Received data from client:", { keyword, location, radius });

//   const locationString = `${location.lat},${location.lng}`;
//   const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
//   const params = {
//     keyword: keyword,
//     location: locationString,
//     radius: radius * 100,
//     key: process.env.React_App_Api_Key,
//   };

//   const queryString = new URLSearchParams(params).toString();
//   const fullUrl = `${url}?${queryString}`;

//   try {
//     const response = await axios.get(fullUrl);

//     console.log("Data received from Google Maps API:", response.data);
//     res.status(200).json({
//       message: "Data received successfully!",
//       googleData: response.data,
//     });
//   } catch (error) {
//     console.error("Error making API request:", error);
//     res.status(500).json({
//       message: "Failed to retrieve data from Google Maps API",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/search2", async (req, res) => {
//   const { placeId } = req.body;

//   console.log("Received data from client:", { placeId });

//   const url = "https://maps.googleapis.com/maps/api/place/details/json";
//   const params = {
//     place_id: placeId,
//     key: process.env.React_App_Api_Key,
//   };

//   const queryString = new URLSearchParams(params).toString();
//   const fullUrl = `${url}?${queryString}`;

//   try {
//     const response = await axios.get(fullUrl);

//     console.log("Data received from Google Maps API:", response.data);
//     res.status(200).json({
//       message: "Data received successfully!",
//       googleData: response.data,
//     });
//   } catch (error) {
//     console.error("Error making API request:", error);
//     res.status(500).json({
//       message: "Failed to retrieve data from Google Maps API",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/search3", async (req, res) => {
//   const { maxwidth, photo_reference } = req.body;

//   console.log("Received data from client:", { maxwidth, photo_reference });

//   const url = "https://maps.googleapis.com/maps/api/place/photo";
//   const params = {
//     maxwidth: maxwidth,
//     photo_reference: photo_reference,
//     key: process.env.React_App_Api_Key,
//   };

//   const queryString = new URLSearchParams(params).toString();
//   const fullUrl = `${url}?${queryString}`;

//   try {
//     const response = await axios({
//       url: fullUrl,
//       method: "GET",
//       responseType: "arraybuffer",
//     });

//     res.set("Content-Type", response.headers["content-type"]);
//     res.send(response.data);
//   } catch (error) {
//     console.error("Error making API request:", error);
//     res.status(500).json({
//       message: "Failed to retrieve data from Google Maps API",
//       error: error.message,
//     });
//   }
// });

// app.post("/api/search4", async (req, res) => {
//   const { lat, lng } = req.body;

//   console.log("Received data from client:", { lat, lng });

//   const url = "https://maps.googleapis.com/maps/api/geocode/json";
//   const params = {
//     latlng: `${lat},${lng}`,
//     key: process.env.React_App_Api_Key,
//   };

//   const queryString = new URLSearchParams(params).toString();
//   const fullUrl = `${url}?${queryString}`;

//   try {
//     const response = await axios.get(fullUrl);

//     console.log("Data received from Google Maps API:", response.data);
//     res.status(200).json({
//       message: "Data received successfully!",
//       googleData: response.data,
//     });
//   } catch (error) {
//     console.error("Error making API request:", error);
//     res.status(500).json({
//       message: "Failed to retrieve data from Google Maps API",
//       error: error.message,
//     });
//   }
// });
