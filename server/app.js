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

helmet({
  crossOriginResourcePolicy: false,
});

app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(mongoSanitize());
app.use(xss());

require("dotenv").config();

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const spotRouter = require("./routes/spotRoutes");
const userRouter = require("./routes/userRoutes");
const mapRouter = require("./routes/mapRoutes");
const chatRouter = require("./routes/chatRoutes");
const postRouter = require("./routes/postRoutes");
const spotlistRouter = require("./routes/spotlistRoutes");
const reportRouter = require("./routes/reportRoutes");

app.use(express.json());

app.use(
  cors({
    origin: [
      "https://bestspot.app",
      "https://www.bestspot.app",
      "https://bestspot.netlify.app",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const limiter = rateLimit({
  max: 100,
  windowMs: 10 * 1500,
  handler: (req, res) => {
    res.status(429).json({
      message: "Too many requests from this IP, please try again later",
    });
  },
});

app.use("/api", limiter);

const mapsRateLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000,
  max: 20,
  message: "Too many requests, please try again later.",
});

app.use("/api/v1/maps/getLocation", mapsRateLimiter);

app.get("/spoticon.ico", (req, res) => res.status(204).end());

app.use("/api/v1/spots", spotRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/maps", mapRouter);
app.use("/api/v1/chats", chatRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/spotlists", spotlistRouter);
app.use("/api/v1/reports", reportRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(globalErrorHandler);

module.exports = app;
