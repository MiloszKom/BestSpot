const User = require("./../models/userModel");
const Spotlist = require("./../models/spotlistModel");
const Spot = require("./../models/spotModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

const { likeEntity, unlikeEntity } = require("../utils/helpers");

const {
  findUser,
  findSpot,
  findSpotlist,
  checkDuplicateSpotlistName,
} = require("../utils/spotlistUtils");

require("dotenv").config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;

const notFoundCover = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/defaults/not-found.jpg`;

exports.getSpotlists = catchAsync(async (req, res) => {
  const user = await findUser(req.user.id);
  const userSpotlists = user.spotlists;

  res.status(200).json({
    status: "success",
    message: "Spotlists retrieved successfully",
    data: userSpotlists,
  });
});

exports.createSpotlist = catchAsync(async (req, res, next) => {
  const { name, visibility, description, spotId } = req.body;

  const user = await findUser(req.user.id);
  const spot = await findSpot(spotId);

  const MAX_TOTAL_SPOTLISTS = 100;

  const totalSpotlistCount = await Spotlist.countDocuments({
    author: user._id,
  });

  if (totalSpotlistCount >= MAX_TOTAL_SPOTLISTS) {
    return next(
      new AppError("You've reached the maximum limit of 100 spotlists.", 403)
    );
  }

  const MAX_SPOTLISTS_PER_HOUR = 10;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const spotlistCount = await Spotlist.countDocuments({
    author: user._id,
    createdAt: { $gte: oneHourAgo },
  });

  if (spotlistCount >= MAX_SPOTLISTS_PER_HOUR) {
    return next(
      new AppError(
        "You've reached the limit for creating spotlists. Try again later.",
        429
      )
    );
  }

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

  if (!spotlist.author.equals(user._id)) {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to edit this spotlist",
    });
  }

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

  if (!spotlist.author.equals(user._id)) {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to delete this spotlist",
    });
  }

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

      if (spotlist.cover === notFoundCover || spotlist.spots.length === 1) {
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
          spotlist.cover = newCoverSpot.photo || notFoundCover;
        } else {
          spotlist.cover = notFoundCover;
        }
      }

      await spotlist.save();
    }
  }

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
    message: "Spotlists updated successfully",
  });
});

exports.likeSpotlist = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("_id name");
  const spotlist = await Spotlist.findById(req.params.id);

  if (!spotlist) {
    return next(new AppError("Spotlist not found", 404));
  }

  await likeEntity(user, spotlist, "spotlist");

  res.status(200).json({
    status: "success",
    message: "Spotlist liked",
  });
});

exports.unlikeSpotlist = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const spotlist = await Spotlist.findById(req.params.id);

  if (!spotlist) {
    return next(new AppError("Spotlist not found", 404));
  }

  await unlikeEntity(user, spotlist, "spotlist");

  res.status(200).json({
    status: "success",
    message: "Spotlist unliked",
  });
});

exports.removeFromSpotlist = catchAsync(async (req, res) => {
  const { spotlistId, spotId } = req.params;

  const user = await findUser(req.user.id);
  const spot = await findSpot(spotId);
  const spotlist = await Spotlist.findById(spotlistId).populate([
    {
      path: "spots",
      select: "_id google_id name rating user_ratings_total photo city country",
    },
    {
      path: "author",
      select: "_id name photo handle friends",
    },
  ]);

  if (!spotlist) throw new AppError("Spotlist not found", 404);

  if (!spotlist.author.equals(user._id)) {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to delete this spot",
    });
  }

  const spotPresentInSpotlists = await Spotlist.find({
    spots: { $in: [spotId] },
  }).select("_id");

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
      spotlist.cover = newCoverSpot.photo || notFoundCover;
    } else {
      spotlist.cover = notFoundCover;
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
  const spotlist = await Spotlist.findById(req.params.id)
    .populate([
      {
        path: "spots",
        select:
          "_id google_id name rating user_ratings_total photo city country likes",
      },
      {
        path: "author",
        select: "_id name photo handle friends",
      },
    ])
    .lean();

  if (!spotlist) {
    return res.status(404).json({
      status: "fail",
      message: "Spotlist not found",
    });
  }

  if (
    spotlist.visibility === "friends-only" &&
    spotlist.author._id.toString() !== req.user?._id.toString()
  ) {
    if (req.user?._id || !spotlist.author.friends.includes(req.user?._id)) {
      return res.status(403).json({
        status: "fail",
        message: `You need to be friends with ${spotlist.author.name} to view this spotlist`,
      });
    }
  }

  if (
    spotlist.visibility === "private" &&
    spotlist.author._id.toString() !== req.user?._id.toString()
  ) {
    return res.status(403).json({
      status: "fail",
      message: "You are not authorized to view this spotlist",
    });
  }

  const likeCount = spotlist.likes.filter((like) => like.isLikeActive).length;
  const isSpotlistLiked = spotlist.likes.some(
    (like) =>
      like._id.toString() === req.user?._id.toString() && like.isLikeActive
  );

  res.status(200).json({
    status: "success",
    message: "Spots retrieved from spotlist successfully",
    data: {
      ...spotlist,
      likeCount,
      isSpotlistLiked,
    },
  });
});

exports.getHubSpotlists = catchAsync(async (req, res) => {
  const sort = req.query.sort;
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  let spotlists;

  if (sort === "popular") {
    spotlists = await Spotlist.find({ visibility: "public" }).lean();

    spotlists.sort((a, b) => {
      const aActiveLikes = a.likes.filter((like) => like.isLikeActive).length;
      const bActiveLikes = b.likes.filter((like) => like.isLikeActive).length;
      return bActiveLikes - aActiveLikes;
    });

    spotlists = spotlists.slice(skip, skip + limit);
  } else {
    spotlists = await Spotlist.find({ visibility: "public" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  res.status(200).json({
    status: "success",
    message: "HubSpotlists retrieved successfully",
    data: spotlists,
  });
});
