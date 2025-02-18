const AppError = require("./../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid request. Please check the URL and try again.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  if (!err.errorResponse.errmsg) {
    return new AppError(
      "Duplicate field value. Please use another value!",
      400
    );
  }
  const match = err.errorResponse.errmsg.match(/\{ (\w+): "([^"]+)" \}/);
  const field = match ? match[1] : "unknown";
  const value = match ? match[2] : "unknown";

  const message = `This ${field} is already taken: ${value}. Please use another ${field}!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  for (const el of Object.values(err.errors)) {
    if (el.path === "password") {
      return new AppError("Password must be at least 8 characters long.", 400);
    }
    if (el.path === "passwordConfirm") {
      return new AppError("Passwords do not match.", 400);
    }
    return new AppError(
      `${el.path.charAt(0).toUpperCase() + el.path.slice(1)}: ${el.message}`,
      400
    );
  }
};

const handlePhotoLimit = () => {
  return new AppError("Too many files uploaded", 400);
};

const handleNetworkError = (err) => {
  return new AppError(
    "Network error. Please check your internet connection and try again.",
    503
  );
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpired = () =>
  new AppError("Your token has expirred! Please log in again", 401);

// ******************************************************

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR: ", err);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = err;
    console.log(err);
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorDB(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpired();
    if (err.code === "LIMIT_UNEXPECTED_FILE") error = handlePhotoLimit();
    if (err.code === "ERR_NETWORK" || err.message.includes("Network Error")) {
      error = handleNetworkError(error);
    }

    sendErrorProd(error, res);
  }
};
