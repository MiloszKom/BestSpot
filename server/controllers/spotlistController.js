const User = require("./../models/userModel");
const Spotlist = require("./../models/spotlistModel");
const Spot = require("./../models/spotModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

const {
  findUser,
  findSpot,
  findSpotlist,
  checkDuplicateSpotlistName,
  checkSpotInOtherSpotlist,
} = require("../utils/spotlistUtils");

exports.getSpotlists = catchAsync(async (req, res) => {
  const user = await findUser(req.user.id);
  const userSpotlists = user.spotlists;

  res.status(200).json({
    status: "success",
    message: "Spotlists retrieved successfully",
    data: userSpotlists,
  });
});

exports.createSpotlist = catchAsync(async (req, res) => {
  const { name, spotId, visibility, note } = req.body;

  const user = await findUser(req.user.id);
  const spot = await findSpot(spotId);

  checkDuplicateSpotlistName(user, name);
  checkSpotInOtherSpotlist(user, spot);

  const newSpotlist = new Spotlist({
    name,
    visibility,
    cover: spot.photo,
    spots: spot._id,
    author: user._id,
  });

  await newSpotlist.save();

  user.spotlists.push(newSpotlist._id);
  await user.save({ validateBeforeSave: false });

  await Spot.findByIdAndUpdate(spot._id, {
    $push: {
      favouritedBy: { userId: user._id, note: note },
    },
  });

  res.status(201).json({
    status: "success",
    message: "Spotlist created successfully",
    data: newSpotlist,
  });
});

exports.editSpotlist = catchAsync(async (req, res) => {
  const { nameIsChanged, newName, newVisibility } = req.body;
  const spotlistId = req.params.id;

  const user = await findUser(req.user.id);
  const spotlist = await findSpotlist(spotlistId);

  if (nameIsChanged) checkDuplicateSpotlistName(user, newName);

  if (newName) spotlist.name = newName;
  if (newVisibility) spotlist.visibility = newVisibility;

  await spotlist.save();

  res.status(200).json({
    status: "success",
    message: "Spotlist updated",
  });
});

exports.deleteSpotlist = catchAsync(async (req, res, next) => {
  const user = await findUser(req.user.id);
  const spotlist = await findSpotlist(req.params.id);

  const spotsToRemove = spotlist.spots;

  await User.findByIdAndUpdate(req.user.id, {
    $pull: { spotlists: spotlist._id },
  });

  await Spot.updateMany(
    { _id: { $in: spotsToRemove } },
    {
      $pull: {
        favouritedBy: { userId: user._id },
      },
    }
  );

  await user.save({ validateBeforeSave: false });

  await Spotlist.findByIdAndDelete(spotlist._id);

  res.status(200).json({
    status: "success",
    message: "Spotlist deleted successfully",
  });
});

exports.addToSpotlist = catchAsync(async (req, res) => {
  const { spotId, note } = req.body;
  const spotlistId = req.params.id;

  const user = await findUser(req.user.id);
  const spot = await findSpot(spotId);
  const spotlist = await findSpotlist(spotlistId);

  checkSpotInOtherSpotlist(user, spot);

  if (spotlist.spots.some((existingSpot) => existingSpot.equals(spot._id))) {
    return res.status(400).json({
      status: "fail",
      message: "Spot is already in the spotlist",
    });
  }

  spotlist.spots.push(spot._id);

  if (spotlist.cover === "no-img-found.jpg" || spotlist.spots.length === 1) {
    spotlist.cover = spot.photo;
  }

  await spotlist.save();

  await user.save({ validateBeforeSave: false });

  await Spot.findByIdAndUpdate(spot._id, {
    $push: { favouritedBy: { userId: user._id, note } },
  });

  res.status(200).json({
    status: "success",
    message: "Spot added to the spotlist",
    data: spotlist,
  });
});

exports.removeFromSpotlist = catchAsync(async (req, res) => {
  const { spotlistId, spotId } = req.params;

  const user = await findUser(req.user.id);
  const spot = await findSpot(spotId);
  const spotlist = await findSpotlist(spotlistId);

  if (!spotlist.spots.some((existingSpot) => existingSpot.equals(spot._id))) {
    return res.status(400).json({
      status: "fail",
      message: "Spot is not in the spotlist",
    });
  }

  spotlist.spots = spotlist.spots.filter(
    (existingSpotId) => !existingSpotId.equals(spot._id)
  );

  if (spotlist.cover === spot.photo) {
    if (spotlist.spots.length > 0) {
      const newCoverSpotId = spotlist.spots[0];
      const newCoverSpot = await findSpot(newCoverSpotId);
      spotlist.cover = newCoverSpot.photo || "no-img-found.jpg";
    } else {
      spotlist.cover = "no-img-found.jpg";
    }
  }

  await spotlist.save();

  await Spot.findByIdAndUpdate(spot._id, {
    $pull: { favouritedBy: { userId: user._id } },
  });

  res.status(200).json({
    status: "success",
    message: "Spot removed from the spotlist",
  });
});

exports.getSpotsInSpotlist = catchAsync(async (req, res) => {
  const spotlist = await Spotlist.findById(req.params.id).populate({
    path: "spots",
    select: "_id google_id name rating user_ratings_total photo city country",
  });

  if (!spotlist) {
    return res.status(404).json({
      status: "fail",
      message: "Spotlist not found",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Spots retrieved from spotlist successfully",
    data: spotlist,
  });
});

exports.editNote = catchAsync(async (req, res) => {
  const { spotlistId, spotId } = req.params;
  const { note } = req.body;

  const user = await findUser(req.user.id);

  const spotlist = await findSpotlist(spotlistId);

  const spotInList = spotlist.spots.find((spotObj) => spotObj.equals(spotId));

  if (!spotInList) {
    return res.status(404).json({
      status: "error",
      message: "Spot is not in the specified spotlist",
    });
  }

  await Spot.findByIdAndUpdate(
    spotId,
    {
      $set: { "favouritedBy.$[elem].note": note },
    },
    {
      arrayFilters: [{ "elem.userId": user._id }],
    }
  );

  res.status(200).json({
    status: "success",
    message: "Spot note updated",
  });
});
