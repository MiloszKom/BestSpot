const multer = require("multer");
const sharp = require("sharp");
const User = require("./../models/userModel");
const Post = require("./../models/postModel");
const Spotlist = require("./../models/spotlistModel");
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

exports.getUserProfile = catchAsync(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  const { handle } = req.params;

  const viewedUser = await User.findOne({ handle });
  if (!viewedUser) {
    return res.status(404).json({ message: "This account doesn't exist" });
  }

  const isCurrentUser = currentUser._id.equals(viewedUser._id);

  const isFriend = viewedUser.friends.some((friendId) =>
    friendId.equals(currentUser._id)
  );

  const postQuery = {
    author: viewedUser._id,
    visibility:
      isCurrentUser || isFriend ? { $in: ["public", "friends"] } : "public",
  };

  const posts = await Post.find(postQuery).populate([
    {
      path: "author",
      select: "_id name photo handle",
    },
    {
      path: "spots",
      select: "_id google_id name photo city country",
    },
    {
      path: "spotlists",
      select: "_id name cover visibility spots",
    },
  ]);

  let inviteStatus;

  if (!isCurrentUser) {
    console.log(viewedUser.pendingRequests);
    if (viewedUser.friends.includes(currentUser._id)) {
      inviteStatus = "accepted";
    } else if (viewedUser.pendingRequests.includes(currentUser._id)) {
      inviteStatus = "pending";
    } else inviteStatus = "not-sent";
  }

  console.log(inviteStatus);

  const spotlistQuery = {
    author: viewedUser._id,
    visibility:
      isCurrentUser || isFriend
        ? { $in: ["public", "friends-only"] }
        : "public",
  };

  const spotlists = await Spotlist.find(spotlistQuery);

  res.status(200).json({
    status: "success",
    message: "User profile, posts, and spotlists",
    data: {
      viewedUser,
      inviteStatus,
      posts,
      spotlists,
    },
  });
});

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

// NOTIFICATION APIS

exports.getNotifications = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("notifications.sender", "_id photo name handle")
    .populate("notifications.originDetails.author", "handle");

  const updatedNotifications = user.notifications.map((notification) => {
    return {
      ...notification.toObject(),
    };
  });

  await User.updateOne(
    { _id: req.user.id },
    {
      $set: { "notifications.$[].isRead": true },
    }
  );

  res.status(200).json({
    status: "success",
    data: updatedNotifications,
  });
});

exports.deleteNotification = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      status: "fail",
      message: "User not found",
    });
  }

  const avaiableNotificationsIds = user.notifications.map((notification) => {
    return notification._id.toString();
  });

  if (!avaiableNotificationsIds.includes(req.params.id)) {
    return res.status(404).json({
      status: "fail",
      message: "Notification not found",
    });
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { notifications: { _id: req.params.id } } },
    { new: true }
  );

  if (!updatedUser) {
    return res.status(500).json({
      status: "fail",
      message: "Error deleting notification",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Notification deleted",
    data: updatedUser.notifications,
  });
});
