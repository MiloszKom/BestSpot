const Spot = require("../models/spotModel");
const User = require("../models/userModel");
const Spotlist = require("./../models/spotlistModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const {
  createNotifications,
  likeEntity,
  unlikeEntity,
} = require("../utils/helpers");

const { deleteImage, uploadImageToS3 } = require("../utils/multerConfig");
require("dotenv").config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;

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

exports.getSpot = catchAsync(async (req, res, next) => {
  const spot = await Spot.findById(req.params.id)
    .populate("author", "_id handle photo name")
    .populate({
      path: "insights",
      populate: {
        path: "user",
        select: "_id handle photo name",
      },
    });

  if (!spot) {
    return next(new AppError("This spot no longer exists.", 404));
  }

  const user = await User.findById(req.user?._id).populate("spotlists");

  if (!spot) {
    return next(new AppError("No spot found with that ID.", 404));
  }

  if (user) {
    spot.insights.sort((a, b) => {
      const aIsUser = a.user._id.toString() === user._id.toString();
      const bIsUser = b.user._id.toString() === user._id.toString();

      if (aIsUser && !bIsUser) return -1;
      if (!aIsUser && bIsUser) return 1;

      return b.likes.length - a.likes.length;
    });
  }

  const spotObj = spot.toObject();
  spotObj.isLiked = spot.isLiked(user);
  spotObj.isSaved = spot.isSaved(user);
  spotObj.spotNote = spot.spotNote(user);

  res.status(200).json({
    status: "success",
    data: {
      ...spotObj,
      isLiked: spot.isLiked(user),
      isSaved: spot.isSaved(user),
      spotNote: spot.spotNote(user),
    },
  });
});

exports.createSpot = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const MAX_SPOTS_PER_HOUR = 10;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const spotCount = await Spot.countDocuments({
    author: user._id,
    createdAt: { $gte: oneHourAgo },
  });

  if (spotCount >= MAX_SPOTS_PER_HOUR) {
    return next(
      new AppError(
        "You've reached the limit for adding spots. Try again later.",
        429
      )
    );
  }

  const { name, overview, category, city, country, photo, address, lat, lng } =
    req.body;

  const existingSpot = await Spot.findOne({ author: user._id, name });

  if (existingSpot) {
    return next(
      new AppError("You've already added a spot with this name.", 400)
    );
  }

  const adjustedAdress = address?.split(",").slice(0, -1).join(",");

  const spotData = {
    author: req.user._id,
    name,
    overview,
    category,
    photo,
    address: adjustedAdress,
    city,
    country,
    geometry: {
      lat,
      lng,
    },
  };

  const newSpot = await Spot.create(spotData);

  await User.findByIdAndUpdate(user._id, {
    $addToSet: { spots: newSpot._id },
  });

  await uploadImageToS3(req.body.photoParams);

  res.status(201).json({
    status: "success",
    message: "Spot created successfully",
    data: newSpot,
  });
});

exports.editSpot = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const spot = await Spot.findById(req.params.id).populate(
    "author",
    "_id handle photo name"
  );

  if (!spot) {
    return next(new AppError("The spot doesn't exist", 404));
  }

  if (!spot.author.equals(user._id)) {
    return next(new AppError("Not authorized to edit this spot", 404));
  }

  const { name, overview, photo } = req.body;

  if (spot.name !== name) {
    const existingSpot = await Spot.findOne({ author: user._id, name });

    if (existingSpot) {
      return next(
        new AppError("You've already added a spot with this name.", 400)
      );
    }
  }

  if (!name) {
    return next(new AppError("Name cannot be empty.", 400));
  }

  const previousPhoto = spot.photo;

  if (name) spot.name = name;
  if (overview !== spot.overview) spot.overview = overview;
  if (photo) spot.photo = photo;

  if (photo && previousPhoto && previousPhoto.includes(bucketName)) {
    const imageKey = previousPhoto.split(
      `${bucketName}.s3.${bucketRegion}.amazonaws.com/`
    )[1];
    await deleteImage(imageKey);
  }

  await spot.save();

  await uploadImageToS3(req.body.photoParams);

  if (photo && previousPhoto !== photo) {
    const spotlists = await Spotlist.find({ cover: previousPhoto });

    for (const spotlist of spotlists) {
      spotlist.cover = photo;
      await spotlist.save();
    }
  }

  res.status(200).json({
    status: "success",
    message: "Spot updated successfully",
    data: {
      spot,
    },
  });
});

exports.deleteSpot = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const spot = await Spot.findById(req.params.id);

  if (!spot) {
    return next(new AppError("Spot not found", 404));
  }

  if (!spot.author.equals(user._id) && user.role !== "admin") {
    return next(new AppError("Not authorized to delete this spot", 404));
  }

  if (spot.photo && spot.photo.includes(bucketName)) {
    const imageKey = spot.photo.split(
      `${bucketName}.s3.${bucketRegion}.amazonaws.com/`
    )[1];
    await deleteImage(imageKey);
  }

  await Spot.deleteOne({ _id: req.params.id });

  const spotlists = await Spotlist.find({ spots: req.params.id });

  for (const spotlist of spotlists) {
    spotlist.spots.pull(req.params.id);

    if (spotlist.cover === spot.photo) {
      spotlist.cover = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/defaults/not-found.jpg`;
    }

    await spotlist.save();
  }

  await User.findByIdAndUpdate(user._id, {
    $pull: { spots: spot._id },
  });

  res.status(200).json({
    status: "success",
    message: "Spot deleted",
  });
});

exports.editNote = catchAsync(async (req, res, next) => {
  const spot = await Spot.findById(req.params.id);
  const user = await User.findById(req.user._id);

  const { note } = req.body;

  if (!spot) {
    return next(new AppError("Spot not found", 404));
  }

  const userFavourite = spot.favouritedBy.find(
    (savedBy) => savedBy.userId.toString() === user._id.toString()
  );

  if (!userFavourite) {
    return next(new AppError("You have to save this spot to add a note", 400));
  }

  userFavourite.note = note;

  await spot.save();

  res.status(200).json({
    status: "success",
    message: "Spot note updated",
  });
});

exports.likeSpot = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("_id name");
  const spot = await Spot.findById(req.params.id);

  if (!spot) {
    return next(new AppError("Spot not found", 404));
  }

  await likeEntity(user, spot, "spot");

  res.status(200).json({
    status: "success",
    message: "Spot liked",
  });
});

exports.unlikeSpot = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const spot = await Spot.findById(req.params.id);

  if (!spot) {
    return next(new AppError("Spot not found", 404));
  }

  await unlikeEntity(user, spot, "spot");

  res.status(200).json({
    status: "success",
    message: "Spot unliked",
  });
});

exports.createAnInsight = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const spot = await Spot.findById(req.params.id);

  if (!spot) {
    return next(new AppError("Spot not found", 404));
  }

  if (spot.author.equals(user._id)) {
    return next(
      new AppError("You can't create an insight on your own spot", 404)
    );
  }

  const { content } = req.body;

  if (content.length === 0) {
    return next(new AppError("Your insight cannot be empty", 404));
  }

  const newInsight = {
    user: user._id,
    content,
  };

  spot.insights.push(newInsight);

  await spot.save();

  const addedInsight = spot.insights[spot.insights.length - 1];

  const populatedInsight = await Spot.populate(addedInsight, {
    path: "user",
    select: "name photo handle",
  });

  const originDetails = {
    author: spot.author,
    spotId: spot._id,
    insightId: addedInsight._id,
  };

  createNotifications(
    [spot.author],
    user._id,
    addedInsight.content,
    originDetails,
    `${user.name} added an insight to your spot`
  );

  res.status(200).json({
    status: "success",
    message: "Your insight has been added",
    data: populatedInsight,
  });
});

exports.deleteAnInsight = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const spot = await Spot.findById(req.params.id);

  if (!spot) {
    return next(new AppError("Spot not found", 404));
  }

  const insight = spot.insights.find(
    (insight) => insight._id.toString() === req.params.insightId
  );

  if (!insight) {
    return next(new AppError("Insight not found", 404));
  }

  if (
    user._id.toString() !== spot.author.toString() &&
    user._id.toString() !== insight.user._id.toString() &&
    user.role !== "admin"
  ) {
    return next(
      new AppError("You are not authorized to delete this insight", 404)
    );
  }

  spot.insights.pull(insight);
  await spot.save();

  res.status(200).json({
    status: "success",
    message: "Insight deleted successfully",
  });
});

exports.likeInsight = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("_id name");
  const spot = await Spot.findById(req.params.id);

  if (!spot) {
    return next(new AppError("Spot not found", 404));
  }

  const insight = spot.insights.find(
    (insight) => insight._id.toString() === req.params.insightId
  );

  if (!insight) {
    return next(new AppError("Insight not found", 404));
  }

  const originDetails = {
    author: spot.author,
    spotId: spot._id,
    insightId: insight._id,
  };

  const existingLike = insight.likes.find((like) => like._id.equals(user._id));
  let activeLikesCount = insight.likes.filter(
    (like) => like.isLikeActive
  ).length;

  if (existingLike) {
    if (existingLike.isLikeActive) {
      return next(new AppError("You already liked this insight", 400));
    }
    existingLike.isLikeActive = true;
    activeLikesCount++;
  } else {
    insight.likes.push({ _id: user._id, isLikeActive: true });
    activeLikesCount++;

    if (activeLikesCount <= 2 && !insight.user.equals(user._id)) {
      await createNotifications(
        [insight.user],
        user._id,
        insight.content,
        originDetails,
        `${user.name} liked your insight`
      );
    }
  }

  const thresholds = [3, 5, 10, 20, 50, 100, 200, 500, 1000];

  if (
    thresholds.includes(activeLikesCount) &&
    !insight.thresholdsReached.includes(activeLikesCount)
  ) {
    createNotifications(
      [insight.user],
      null,
      insight.content,
      originDetails,
      `Your insight has reached ${activeLikesCount} likes`
    );

    insight.thresholdsReached.push(activeLikesCount);
  }

  await spot.save();

  res.status(200).json({
    status: "success",
    message: "Insight liked",
  });
});

exports.unlikeInsight = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const spot = await Spot.findById(req.params.id);

  if (!spot) {
    return next(new AppError("Spot not found", 404));
  }

  const insight = spot.insights.find(
    (insight) => insight._id.toString() === req.params.insightId
  );

  if (!insight) {
    return next(new AppError("Insight not found", 404));
  }

  const existingLike = insight.likes.find((like) => like._id.equals(user._id));

  if (!existingLike || !existingLike.isLikeActive) {
    return next(new AppError("You have not liked this insight", 400));
  }

  existingLike.isLikeActive = false;
  await spot.save();

  res.status(200).json({
    status: "success",
    message: "Insight unliked",
  });
});

exports.getSpotLibrary = catchAsync(async (req, res) => {
  const sort = req.query.sort;
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  let spots;

  if (sort === "popular") {
    spots = await Spot.find().lean();

    spots.sort((a, b) => {
      const aActiveLikes = a.likes.filter((like) => like.isLikeActive).length;
      const bActiveLikes = b.likes.filter((like) => like.isLikeActive).length;
      return bActiveLikes - aActiveLikes;
    });

    spots = spots.slice(skip, skip + limit);
  } else {
    spots = await Spot.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
  }

  res.status(200).json({
    status: "success",
    message: "SpotLibrary retrieved successfully",
    data: spots,
  });
});

exports.getLatestSpots = catchAsync(async (req, res) => {
  const spots = await Spot.find()
    .sort({ createdAt: -1 })
    .select("photo name city country createdAt")
    .limit(5)
    .lean();

  res.status(200).json({
    status: "success",
    data: spots,
  });
});
