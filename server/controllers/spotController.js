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
  console.log("MulterFilter :", file);
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

exports.uploadTourImages = upload.fields([{ name: "photo", maxCount: 3 }]);

exports.adjustUserPhoto = async (req, res, next) => {
  if (!req.files || !req.files["photo"]) return next();
  await Promise.all(
    req.files["photo"].map(async (file, index) => {
      const filename = `spot-${req.body.google_id}-${index + 1}.jpeg`;

      await sharp(file.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`uploads/images/${filename}`);

      if (!req.body.photos) req.body.photos = [];
      req.body.photos.push(filename);
    })
  );

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
  const spot = await Spot.findOne({ google_id: req.params.id }).populate(
    "favouritedBy.userId",
    "photo name spotlists"
  );

  console.log(spot.favouritedBy);

  const user = await User.findById(req.user._id);

  if (!spot) {
    return next(new AppError("No spot found with that ID", 404));
  }

  const spotlistData = user.spotlists.find((spotlist) =>
    spotlist.spots.some(
      (spotItem) => spotItem.spot.toString() === spot._id.toString()
    )
  );

  const spotlistId = spotlistData ? spotlistData._id : null;
  const isFavourite = !!spotlistData;

  const userNote = spotlistData
    ? spotlistData.spots.find(
        (spotItem) => spotItem.spot.toString() === spot._id.toString()
      )?.note
    : null;

  const friendsWhoFavourited = spot.favouritedBy
    .filter((fav) =>
      user.friends.some((friend) => friend._id.equals(fav.userId._id))
    )
    .map((fav) => {
      const friendSpotlist = fav.userId.spotlists.find((spotlist) =>
        spotlist.spots.some(
          (spotItem) => spotItem.spot.toString() === spot._id.toString()
        )
      );

      if (!friendSpotlist || friendSpotlist.visibility === "private") {
        return undefined;
      }

      const friendNote = friendSpotlist
        ? friendSpotlist.spots.find(
            (spotItem) => spotItem.spot.toString() === spot._id.toString()
          )?.note
        : null;

      return {
        id: fav.userId._id,
        name: fav.userId.name,
        photo: fav.userId.photo,
        note: friendNote,
      };
    })
    .filter((item) => item !== undefined);

  res.status(200).json({
    status: "success",
    data: {
      spot,
      isFavourite,
      spotlistId,
      userNote,
      friendsWhoFavourited,
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
