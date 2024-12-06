const multer = require("multer");
const sharp = require("sharp");
const User = require("./../models/userModel");
const Spot = require("./../models/spotModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
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

exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/images/${req.file.filename}`);

  next();
};

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log(req.file);

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, "name", "email");

  if (req.file) filteredBody.photo = req.file.filename;

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  user.name = filteredBody.name || user.name;
  user.email = filteredBody.email || user.email;
  if (req.file) user.photo = req.file.filename;

  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      user: user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).populate([
    {
      path: "pendingRequests",
      select: "name photo isOnline",
    },
    {
      path: "friends",
      select: "name photo isOnline",
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};

// SPOTLIST APIS

// Helper functions

const findUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  return user;
};

const findSpot = async (spotId) => {
  const spot = await Spot.findById(spotId);
  if (!spot) throw new Error("Spot not found");
  return spot;
};

const findSpotlist = (user, spotlistId) => {
  const spotlist = user.spotlists.find(
    (spotlist) => spotlist._id.toString() === spotlistId
  );
  if (!spotlist) throw new Error("Spotlist not found");
  return spotlist;
};

const checkDuplicateSpotlistName = (user, name) => {
  const existingSpotlist = user.spotlists.find(
    (spotlist) => spotlist.name === name
  );
  if (existingSpotlist)
    throw new Error("A spotlist with this name already exists");
};

const checkSpotInOtherSpotlist = (user, spot) => {
  const alreadyInSpotlist = user.spotlists.some((spotlist) =>
    spotlist.spots.some((existingSpot) => existingSpot.spot.equals(spot._id))
  );
  if (alreadyInSpotlist) throw new Error("Spot is already saved in a spotlist");
};

exports.getSpotlist = catchAsync(async (req, res) => {
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

  user.spotlists.push({
    name,
    visibility,
    cover: spot.photos[0] || "no-img-found.jpg",
    spots: [{ spot: spot._id, note: note }],
  });

  await user.save({ validateBeforeSave: false });
  const spotlistId = user.spotlists[user.spotlists.length - 1]._id;

  await Spot.findByIdAndUpdate(spot._id, {
    $push: {
      favouritedBy: { userId: user._id, note: note },
    },
  });

  res.status(201).json({
    status: "success",
    message: "Spotlist created successfully",
    data: { spotlistId },
  });
});

exports.deleteSpotlist = catchAsync(async (req, res) => {
  const spotlistId = req.params.id;
  const user = await findUser(req.user.id);
  const spotlist = findSpotlist(user, spotlistId);

  const spotsToRemove = spotlist.spots.map((spotObj) => spotObj.spot);

  user.spotlists = user.spotlists.filter(
    (spotlist) => spotlist._id.toString() !== spotlistId
  );

  await Spot.updateMany(
    { _id: { $in: spotsToRemove } },
    {
      $pull: {
        favouritedBy: { userId: user._id },
      },
    }
  );

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Spotlist deleted successfully",
  });
});

exports.editSpotlist = catchAsync(async (req, res) => {
  const { nameIsChanged, newName, newVisibility } = req.body;
  const spotlistId = req.params.id;

  const user = await findUser(req.user.id);
  const spotlist = findSpotlist(user, spotlistId);

  if (nameIsChanged) checkDuplicateSpotlistName(user, newName);

  if (newName) spotlist.name = newName;
  if (newVisibility) spotlist.visibility = newVisibility;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Spotlist updated",
  });
});

exports.addToSpotlist = catchAsync(async (req, res) => {
  const { spotId, note } = req.body;
  const spotlistId = req.params.id;

  const user = await findUser(req.user.id);
  const spot = await findSpot(spotId);
  const spotlist = findSpotlist(user, spotlistId);

  checkSpotInOtherSpotlist(user, spot);

  if (
    spotlist.spots.some((existingSpot) => existingSpot.spot.equals(spot._id))
  ) {
    return res.status(400).json({
      status: "fail",
      message: "Spot is already in the spotlist",
    });
  }

  spotlist.spots.push({ spot: spot._id, note });

  if (spotlist.cover === "no-img-found.jpg" || spotlist.spots.length === 1) {
    spotlist.cover = spot.photos[0] || "no-img-found.jpg";
  }

  await user.save({ validateBeforeSave: false });

  await Spot.findByIdAndUpdate(spot._id, {
    $push: { favouritedBy: { userId: user._id, note } },
  });

  res.status(200).json({
    status: "success",
    message: "Spot added to the spotlist",
    data: { spotlistId: spotlist._id },
  });
});

exports.removeFromSpotlist = catchAsync(async (req, res) => {
  const { spotlistId, spotId } = req.params;

  const user = await findUser(req.user.id);
  const spot = await findSpot(spotId);
  const spotlist = findSpotlist(user, spotlistId);

  if (
    !spotlist.spots.some((existingSpot) => existingSpot.spot.equals(spot._id))
  ) {
    return res.status(404).json({
      status: "fail",
      message: "Spot is not in the spotlist",
    });
  }

  spotlist.spots = spotlist.spots.filter(
    (existingSpot) => !existingSpot.spot.equals(spot._id)
  );

  if (spotlist.cover === spot.photos[0]) {
    if (spotlist.spots.length > 0) {
      const newCoverSpotId = spotlist.spots[0].spot;
      const newCoverSpot = await findSpot(newCoverSpotId);
      spotlist.cover = newCoverSpot.photos[0] || "no-img-found.jpg";
    } else {
      spotlist.cover = "no-img-found.jpg";
    }
  }

  await user.save({ validateBeforeSave: false });

  await Spot.findByIdAndUpdate(spot._id, {
    $pull: { favouritedBy: { userId: user._id } },
  });

  res.status(200).json({
    status: "success",
    message: "Spot removed from the spotlist",
  });
});

exports.getSpotsInSpotlist = catchAsync(async (req, res) => {
  const spotlistId = req.params.id;

  const user = await User.findById(req.user.id).populate({
    path: "spotlists.spots.spot",
    model: "Spot",
    select: "google_id name rating user_ratings_total photos",
  });

  const spotlist = findSpotlist(user, spotlistId);

  res.status(200).json({
    status: "success",
    message: "Spots retrieved from spotlist successfully",
    data: spotlist.spots,
  });
});

exports.editNote = catchAsync(async (req, res) => {
  const { spotlistId, spotId } = req.params;
  const { note } = req.body;

  const user = await findUser(req.user.id);

  const spotlist = findSpotlist(user, spotlistId);

  const spotInList = spotlist.spots.find((spotObj) =>
    spotObj.spot.equals(spotId)
  );

  if (!spotInList) {
    return res.status(404).json({
      status: "error",
      message: "Spot is not in the specified spotlist",
    });
  }

  spotInList.note = note;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Spot note updated",
  });
});

// FRIENDS APIS

exports.sendFriendRequest = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  const friend = await User.findById(req.params.id);

  const isAlreadySent = await User.findOne({
    _id: user._id,
    sentRequests: { $in: [friend._id] },
  });

  if (isAlreadySent) {
    return res.status(409).json({
      status: "fail",
      message: "Friend request has already been sent.",
    });
  } else {
    await User.findByIdAndUpdate(
      user._id,
      { $addToSet: { sentRequests: friend._id } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      friend._id,
      { $addToSet: { pendingRequests: user._id } },
      { new: true }
    );
  }

  res.status(201).json({
    status: "success",
    message: "Friend request sent!",
  });
});

exports.cancelFriendRequest = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  const friend = await User.findById(req.params.id);

  const isRequestSent = await User.findOne({
    _id: user._id,
    sentRequests: { $in: [friend._id] },
  });

  if (!isRequestSent) {
    return res.status(400).json({
      status: "fail",
      message: "No friend request to cancel.",
    });
  }

  await User.findByIdAndUpdate(
    user._id,
    { $pull: { sentRequests: friend._id } },
    { new: true }
  );

  await User.findByIdAndUpdate(
    friend._id,
    { $pull: { pendingRequests: user._id } },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Friend request canceled.",
  });
});

exports.acceptFriendRequest = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  const friend = await User.findById(req.params.id);

  await User.findByIdAndUpdate(
    user._id,
    {
      $pull: { pendingRequests: friend._id },
      $push: { friends: friend._id },
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    friend._id,
    {
      $pull: { sentRequests: user._id },
      $push: { friends: user._id },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Friend request accepted",
  });
});

exports.rejectFriendRequest = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  const friend = await User.findById(req.params.id);

  await User.findByIdAndUpdate(
    user._id,
    {
      $pull: { pendingRequests: friend._id },
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    friend._id,
    {
      $pull: { sentRequests: user._id },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Friend request rejected",
  });
});

exports.deleteFriend = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  const friend = await User.findById(req.params.id);

  await User.findByIdAndUpdate(
    user._id,
    {
      $pull: { friends: friend._id },
    },
    { new: true }
  );

  await User.findByIdAndUpdate(
    friend._id,
    {
      $pull: { friends: user._id },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Friend successfully deleted",
  });
});

exports.searchUsers = catchAsync(async (req, res) => {
  const searchTerm = req.query.q;
  try {
    const users = await User.find({
      name: { $regex: searchTerm, $options: "i" },
      _id: { $ne: req.user._id },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
