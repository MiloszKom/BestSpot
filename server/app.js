const express = require("express");
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

helmet({
  crossOriginResourcePolicy: false,
});

app.use(morgan("dev"));

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());

require("dotenv").config();

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const favRouter = require("./routes/favRoutes");
const userRouter = require("./routes/userRoutes");
const mapRouter = require("./routes/mapRoutes");

app.use(express.json());

app.use(
  cors({
    origin: [`http://${process.env.REACT_APP_SERVER}:3001`],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type"],
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
app.use("/api/v1/maps", mapRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

module.exports = app;
