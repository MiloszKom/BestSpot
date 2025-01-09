const multer = require("multer");
const sharp = require("sharp");
const User = require("./../models/userModel");
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

// FRIENDS APIS

exports.getFriends = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("friends")
    .populate("friends", "_id name handle photo isOnline");

  const friends = user.friends;

  res.status(200).json({
    status: "success",
    data: friends,
  });
});

exports.getRequests = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select("pendingRequests")
    .populate("pendingRequests", "_id name handle photo");

  res.status(200).json({
    status: "success",
    data: user,
  });
});

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
    }).select("name _id photo handle friends");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

exports.searchHandles = catchAsync(async (req, res) => {
  const searchTerm = req.query.q;
  const users = await User.find({
    handle: { $regex: searchTerm, $options: "i" },
    _id: { $ne: req.user._id },
  }).select("name _id photo handle");

  res.status(200).json({
    status: "success",
    users,
  });
});
