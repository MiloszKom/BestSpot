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
  const { name, visibility, description, spotId } = req.body;

  const user = await findUser(req.user.id);
  const spot = await findSpot(spotId);

  checkDuplicateSpotlistName(user, name);

  const newSpotlist = new Spotlist({
    author: user._id,
    name,
    visibility,
    cover: spot.photo,
    description,
    spots: spot._id,
  });

  await newSpotlist.save();

  user.spotlists.push(newSpotlist._id);
  await user.save({ validateBeforeSave: false });

  const existingSpot = await Spot.findById(spot._id);

  const alreadyFavourited = existingSpot.favouritedBy.some(
    (entry) => entry.userId.toString() === user._id.toString()
  );

  if (!alreadyFavourited) {
    existingSpot.favouritedBy.push({ userId: user._id, note: "" });
    await existingSpot.save();
  }

  res.status(201).json({
    status: "success",
    message: "Spotlist created successfully",
    data: newSpotlist,
  });
});

exports.editSpotlist = catchAsync(async (req, res) => {
  const { nameIsChanged, newName, newVisibility, newDescription } = req.body;
  const spotlistId = req.params.id;

  const user = await findUser(req.user.id);
  const spotlist = await findSpotlist(spotlistId);

  if (nameIsChanged) checkDuplicateSpotlistName(user, newName);

  if (newName) spotlist.name = newName;
  if (newVisibility) spotlist.visibility = newVisibility;
  spotlist.description = newDescription;

  await spotlist.save();

  res.status(200).json({
    status: "success",
    message: "Spotlist updated",
    data: {
      spotlist,
    },
  });
});

exports.deleteSpotlist = catchAsync(async (req, res, next) => {
  const user = await findUser(req.user.id);
  const spotlist = await findSpotlist(req.params.id);

  const spotsToRemove = spotlist.spots;

  await User.findByIdAndUpdate(req.user.id, {
    $pull: { spotlists: spotlist._id },
  });

  const otherSpotlists = await Spotlist.find({
    _id: { $ne: spotlist._id },
    spots: { $in: spotsToRemove },
    author: user._id,
  });

  const spotsToKeep = new Set(
    otherSpotlists.flatMap((list) => list.spots.map((spot) => spot.toString()))
  );

  const spotsToUpdate = spotsToRemove.filter(
    (spot) => !spotsToKeep.has(spot.toString())
  );

  if (spotsToUpdate.length > 0) {
    await Spot.updateMany(
      { _id: { $in: spotsToUpdate } },
      {
        $pull: {
          favouritedBy: { userId: user._id },
        },
      }
    );
  }

  await Spotlist.findByIdAndDelete(spotlist._id);

  // Works for now but needs further testing

  res.status(200).json({
    status: "success",
    message: "Spotlist deleted successfully",
  });
});

exports.updateSpotlists = catchAsync(async (req, res) => {
  const { spotId, spotlistsAdded, spotlistsRemoved } = req.body;

  const user = await findUser(req.user.id);
  const spot = await findSpot(spotId);

  const spotPresentInSpotlists = await Spotlist.find({
    spots: { $in: [spotId] },
  }).select("_id");

  let spotPresentInSpotlistsModified = spotPresentInSpotlists.map((spot) =>
    spot._id.toString()
  );

  for (const spotlistId of spotlistsAdded) {
    const spotlist = await findSpotlist(spotlistId);

    if (!spotlist) {
      return res.status(404).json({
        status: "fail",
        message: `Spotlist with ID ${spotlistId} not found`,
      });
    }

    if (!spotlist.spots.some((existingSpot) => existingSpot.equals(spot._id))) {
      spotPresentInSpotlistsModified.push(spotlist._id.toString());

      spotlist.spots.push(spot._id);

      if (
        spotlist.cover === "no-img-found.jpg" ||
        spotlist.spots.length === 1
      ) {
        spotlist.cover = spot.photo;
      }

      await spotlist.save();
    }
  }

  for (const spotlistId of spotlistsRemoved) {
    const spotlist = await findSpotlist(spotlistId);

    if (!spotlist) {
      return res.status(404).json({
        status: "fail",
        message: `Spotlist with ID ${spotlistId} not found`,
      });
    }

    if (spotlist.spots.some((existingSpot) => existingSpot.equals(spot._id))) {
      spotPresentInSpotlistsModified = spotPresentInSpotlistsModified.filter(
        (id) => id !== spotlist._id.toString()
      );

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
    }
  }

  const isSavedInAnySpotlist = spotPresentInSpotlistsModified.length > 0;

  if (
    spotPresentInSpotlists.length === 0 &&
    spotPresentInSpotlistsModified.length > 0
  ) {
    spot.favouritedBy.push({ userId: user._id, note: "" });
    await spot.save();
  }

  if (
    spotPresentInSpotlists.length > 0 &&
    spotPresentInSpotlistsModified.length === 0
  ) {
    spot.favouritedBy = spot.favouritedBy.filter(
      (entry) => entry.userId.toString() !== user._id.toString()
    );
    await spot.save();
  }

  res.status(200).json({
    status: "success",
    message: "Spotlists have been updated",
    isSavedInAnySpotlist,
  });
});

exports.removeFromSpotlist = catchAsync(async (req, res) => {
  const { spotlistId, spotId } = req.params;

  const user = await findUser(req.user.id);
  const spot = await findSpot(spotId);
  const spotlist = await Spotlist.findById(spotlistId).populate(
    "spots",
    "_id google_id name rating user_ratings_total photo city country"
  );
  if (!spotlist) throw new AppError("Spotlist not found", 404);

  const spotPresentInSpotlists = await Spotlist.find({
    spots: { $in: [spotId] },
  }).select("_id");

  console.log(spotPresentInSpotlists.length);

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

  if (spotPresentInSpotlists.length === 1) {
    spot.favouritedBy = spot.favouritedBy.filter(
      (entry) => entry.userId.toString() !== user._id.toString()
    );
    await spot.save();
  }

  res.status(200).json({
    status: "success",
    message: "Spot removed from the spotlist",
    data: spotlist,
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
