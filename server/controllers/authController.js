const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
require("dotenv").config();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        (process.env.JWT_COOKIE_EXPIRES_IN || 30) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  };

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user,
    },
  });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select(
    "+password role handle photo _id chatsJoined name email"
  );

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res, "Successfully logged in.");
});

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res, "Account created.");
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });
  res.status(200).json({
    status: "success",
  });
};

const getUserFromToken = async (token) => {
  if (!token) return null;
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).select(
    "+password role handle photo _id chatsJoined name email"
  );

  if (!currentUser) return null;

  if (currentUser.changedPasswordAfter(decoded.iat)) return null;

  return currentUser;
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  const currentUser = await getUserFromToken(token);

  if (!currentUser) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }
  req.user = currentUser;

  next();
});

exports.softAuth = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  let currentUser;

  if (token !== "undefined" && token !== "loggedout") {
    currentUser = await getUserFromToken(token);
  }

  if (currentUser) {
    req.user = currentUser;
  }

  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;
  if (!passwordCurrent || !password || !passwordConfirm) {
    return next(
      new AppError(
        "Please provide your current password, new password, and password confirmation.",
        400
      )
    );
  }

  if (password !== passwordConfirm) {
    return next(
      new AppError("New password and password confirmation do not match.", 400)
    );
  }

  const user = await User.findById(req.user.id).select(
    "+password role handle photo _id chatsJoined name email"
  );
  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new AppError("Your current password is incorrect.", 401));
  }

  if (await user.correctPassword(password, user.password)) {
    return next(
      new AppError(
        "New password must be different from the current password.",
        400
      )
    );
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createSendToken(user, 200, res, "Password updated successfully.");
});

exports.checkCookies = catchAsync(async (req, res, next) => {
  if (!req.cookies.jwt || req.cookies.jwt === "loggedout") {
    return res.status(204).json({
      status: "no-content",
      message: "No authentication cookie found",
    });
  }

  const token = req.cookies.jwt;

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id).select(
      "role handle photo _id chatsJoined name email"
    );

    if (!currentUser) {
      return next(
        new AppError("The user belonging to this token no longer exists", 401)
      );
    }

    return res.status(200).json({
      status: "success",
      user: currentUser,
      token,
    });
  } catch (err) {
    return next(
      new AppError("Invalid token or token verification failed.", 401)
    );
  }
});
