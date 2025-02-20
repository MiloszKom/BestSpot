const User = require("./../models/userModel");
const Post = require("./../models/postModel");
const Spotlist = require("./../models/spotlistModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

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
  const { name, email } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError("User not found.", 404));

  if (name) user.name = name;
  if (email) user.email = email;
  if (req.file) user.photo = req.file.filename;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Your settings have been updated successfully.",
    data: { user },
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

// Profile APIs

exports.getUserProfile = catchAsync(async (req, res, next) => {
  const currentUser = req.user?._id;
  const { handle } = req.params;

  const viewedUser = await User.findOne({ handle }).select(
    "_id name photo handle friends pendingRequests"
  );

  if (!viewedUser) {
    return next(new AppError("This account doens't exist", 404));
  }

  const isCurrentUser = currentUser?._id.equals(viewedUser._id);
  const isFriend = viewedUser.friends.includes(currentUser?._id);

  let inviteStatus = "not-sent";
  if (!isCurrentUser) {
    if (isFriend) inviteStatus = "accepted";
    else if (viewedUser.pendingRequests.includes(currentUser?._id))
      inviteStatus = "pending";
  }

  res.status(200).json({
    status: "success",
    message: "User profile info",
    data: { viewedUser, inviteStatus },
  });
});

exports.getUserProfilePosts = catchAsync(async (req, res, next) => {
  const currentUser = req.user?._id;
  const { handle } = req.params;
  const viewedUser = await User.findOne({ handle }).select("_id friends");

  if (!viewedUser) {
    return next(new AppError("This account doesn't exist", 404));
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const isCurrentUser = currentUser?._id.equals(viewedUser._id);
  const isFriend = viewedUser.friends.includes(currentUser?._id);

  const postQuery = {
    author: viewedUser._id,
    visibility:
      isCurrentUser || isFriend ? { $in: ["public", "friends"] } : "public",
  };

  const posts = await Post.find(postQuery)
    .populate([
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
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const formattedPosts = posts.map((post) => {
    const likeCount = post.likes.filter((like) => like.isLikeActive).length;
    const isLiked = post.likes.some(
      (like) =>
        like._id.toString() === currentUser?._id.toString() && like.isLikeActive
    );
    const bookmarkCount = post.bookmarks.filter(
      (bookmark) => bookmark.isLikeActive
    ).length;
    const isBookmarked = post.bookmarks.some(
      (bookmark) =>
        bookmark._id.toString() === currentUser?._id.toString() &&
        bookmark.isLikeActive
    );

    const totalComments =
      post.comments?.reduce(
        (total, comment) => total + 1 + (comment.replies?.length || 0),
        0
      ) || 0;

    return {
      ...post.toObject(),
      likeCount,
      isLiked,
      bookmarkCount,
      isBookmarked,
      totalComments,
    };
  });

  res.status(200).json({
    status: "success",
    message: "User profile posts",
    data: formattedPosts,
  });
});

exports.getUserProfileSpotlists = catchAsync(async (req, res, next) => {
  const currentUser = req.user?._id;
  const { handle } = req.params;
  const viewedUser = await User.findOne({ handle }).select("_id friends");

  if (!viewedUser) {
    return next(new AppError("This account doesn't exist", 404));
  }

  const isCurrentUser = currentUser?._id.equals(viewedUser._id);
  const isFriend = viewedUser.friends.includes(currentUser?._id);

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
    message: "User profile spotlists",
    data: spotlists,
  });
});

exports.getUserProfileSpots = catchAsync(async (req, res, next) => {
  const { handle } = req.params;
  const viewedUser = await User.findOne({ handle })
    .select("_id spots")
    .populate("spots");

  if (!viewedUser) {
    return next(new AppError("This account doesn't exist", 404));
  }

  const viewedUserSpots = viewedUser.spots;

  res.status(200).json({
    status: "success",
    message: "User profile spots",
    data: viewedUserSpots,
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

exports.getGlobalNotifications = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  const unreadNotifications = user.notifications.filter(
    (notification) => !notification.isRead
  );

  const pendingRequests = user.pendingRequests;

  res.status(200).json({
    status: "success",
    message: "Notifications retrieved",
    data: {
      unreadNotifications: unreadNotifications.length,
      pendingRequests: pendingRequests.length,
    },
  });
});

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
