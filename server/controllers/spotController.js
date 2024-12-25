const multer = require("multer");
const sharp = require("sharp");
const Spot = require("../models/spotModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const path = require("path");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  console.log("MulterFilter:", file);
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImage = upload.single("photo");

exports.adjustUserPhoto = async (req, res, next) => {
  if (!req.file) return next();

  const filename = `spot-${req.body.google_id}.jpeg`;

  try {
    await sharp(req.file.buffer)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/images/${filename}`);

    req.body.photo = filename;
  } catch (error) {
    return next(new AppError("Error processing image", 500));
  }

  next();
};

exports.getAllUserSpot = catchAsync(async (req, res) => {
  const favs = await Spot.find({ "favouritedBy.userId": req.user.id });

  res.status(200).json({
    status: "success",
    results: favs.length,
    data: {
      favs,
    },
  });
});

exports.createSpot = catchAsync(async (req, res) => {
  if (req.body.current_opening_hours) {
    req.body.current_opening_hours = JSON.parse(req.body.current_opening_hours);
    delete req.body.current_opening_hours.open_now;
  }

  if (req.body.reviews) {
    req.body.reviews = JSON.parse(req.body.reviews);
  }

  if (req.body.geometry) {
    req.body.geometry = JSON.parse(req.body.geometry);
  }

  if (req.body.place_id) {
    delete req.body.place_id;
  }

  if (req.body.photos) {
    req.body.photos = req.body.photos.sort(
      (a, b) => a[a.length - 6] - b[b.length - 6]
    );
  }

  const newSpot = await Spot.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      fav: newSpot,
    },
  });
});

exports.getSpot = catchAsync(async (req, res, next) => {
  const spot = await Spot.findOne({ google_id: req.params.id });

  // console.log("SPOT :", spot);

  const user = await User.findById(req.user._id).populate("spotlists");

  if (!spot) {
    return next(new AppError("No spot found with that ID", 404));
  }

  // if a spot belongs to a spotlist, find it's id and pass it to spotlistId

  const spotlistData = user.spotlists.find((spotlist) =>
    spotlist.spots.some(
      (spotItem) => spotItem._id.toString() === spot._id.toString()
    )
  );

  console.log(spotlistData);

  const isFavourite = spotlistData ? true : false;

  const userNote =
    spot.favouritedBy.find(
      (fav) => fav.userId.toString() === user._id.toString()
    )?.note || null;

  // const friendsWhoFavourited = spot.favouritedBy
  //   .filter((fav) =>
  //     user.friends.some((friend) => friend._id.equals(fav.userId._id))
  //   )
  //   .map((fav) => {
  //     const friendSpotlist = fav.userId.spotlists.find((spotlist) =>
  //       spotlist.spots.some(
  //         (spotItem) => spotItem.spot.toString() === spot._id.toString()
  //       )
  //     );

  //     if (!friendSpotlist || friendSpotlist.visibility === "private") {
  //       return undefined;
  //     }

  //     const friendNote = friendSpotlist
  //       ? friendSpotlist.spots.find(
  //           (spotItem) => spotItem.spot.toString() === spot._id.toString()
  //         )?.note
  //       : null;

  //     return {
  //       id: fav.userId._id,
  //       name: fav.userId.name,
  //       photo: fav.userId.photo,
  //       note: friendNote,
  //     };
  //   })
  //   .filter((item) => item !== undefined);

  res.status(200).json({
    status: "success",
    data: {
      spot,
      isFavourite,
      spotlistId: spotlistData?._id,
      userNote,
      // friendsWhoFavourited,
    },
  });
});

exports.updateSpot = catchAsync(async (req, res) => {
  const fav = await Spot.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!fav) {
    return next(new AppError("No favourite found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      fav,
    },
  });
});

exports.deleteSpot = catchAsync(async (req, res, next) => {
  const fav = await Spot.findById(req.params.id);
  await Spot.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
