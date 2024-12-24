const Post = require("./../models/postModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");

const { getPostCommentReply } = require("../utils/helpers");

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

exports.uploadPostPhotos = upload.array("photos", 5);

exports.resizePostPhotos = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  req.body.photos = [];

  try {
    await Promise.all(
      req.files.map(async (file, index) => {
        const filename = `user-${req.user._id}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(file.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`uploads/images/${filename}`);

        req.body.photos.push(filename);
      })
    );

    next();
  } catch (err) {
    console.log(err);
    return next(
      new AppError("Error processing images. Please try again.", 500)
    );
  }
};

exports.uploadErrorHandler = (err, req, res, next) => {
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return next(
      new AppError(
        "Too many files uploaded. A maximum of 5 photos is allowed.",
        400
      )
    );
  }
  next(err);
};

const createNotifications = async (
  notifiedUsers,
  sender,
  message,
  relatedEntity
) => {
  const notification = {
    message,
    sender,
    relatedEntity,
    createdAt: new Date(),
    isRead: false,
  };

  const updatePromises = notifiedUsers.map((user) =>
    User.findByIdAndUpdate(
      user._id,
      { $push: { notifications: notification } },
      { new: true }
    )
  );

  await Promise.all(updatePromises);
};

const extractAndValidateHandles = async (content) => {
  const handlePattern = /@([a-zA-Z0-9_]{3,30})/g;
  const handles = [];
  let match;

  while ((match = handlePattern.exec(content)) !== null) {
    handles.push(match[1]);
  }

  if (handles.length === 0) return [];

  const validUsers = await User.find(
    { handle: { $in: handles } },
    "_id handle"
  );

  return validUsers;
};

const filterFriends = (validUsers, friends) => {
  const validUserIds = validUsers.map((user) => user._id.toString());

  const filteredFriends = friends.filter(
    (friend) => !validUserIds.includes(friend._id.toString())
  );

  return filteredFriends;
};

exports.getPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "authorDetails",
      },
    },
    {
      $unwind: "$authorDetails",
    },
    {
      $lookup: {
        from: "spots",
        localField: "spots",
        foreignField: "_id",
        as: "populatedSpots",
      },
    },
    {
      $project: {
        _id: 1,
        content: 1,
        visibility: 1,
        spotlists: 1,
        photos: 1,
        likes: 1,
        createdAt: 1,
        commentsLength: { $size: "$comments" },
        author: {
          _id: "$authorDetails._id",
          name: "$authorDetails.name",
          photo: "$authorDetails.photo",
          handle: "$authorDetails.handle",
        },
        spots: "$populatedSpots",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: posts,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate(
    "friends",
    "_id handle"
  );

  const { visibility, content, spots, spotlists, photos } = req.body;

  if (!user) {
    return next(new AppError("No user found", 404));
  }

  if (spots?.length > 0 && spotlists?.length > 0) {
    return next(
      new AppError(
        "You can include either spots or spotlists, but not both.",
        400
      )
    );
  }

  if (Array.isArray(spots) && spots.length > 5) {
    return next(new AppError("Spots limit exceeded", 400));
  }

  if (Array.isArray(spotlists) && spotlists.length > 3) {
    return next(new AppError("Spotlists limit exceeded", 400));
  }

  const mentionedUsers = await extractAndValidateHandles(content);
  const userFriends = filterFriends(mentionedUsers, user.friends);

  const newPost = await Post.create({
    author: user._id,
    visibility,
    content,
    spots,
    spotlists,
    photos: photos ? photos : null,
  });

  user.posts.push(newPost._id);
  await user.save({ validateBeforeSave: false });

  createNotifications(
    mentionedUsers,
    user._id,
    "You have been mentioned in a post",
    newPost._id
  );

  createNotifications(
    userFriends,
    user._id,
    `${user.name} created a new post`,
    newPost._id
  );

  res.status(201).json({
    status: "success",
    message: "Post has been created",
    data: newPost,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("No user found", 404));
  }

  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (!post.author.equals(user._id)) {
    return next(new AppError("Not authorized to delete this post", 404));
  }

  user.posts.pull(post._id);
  await user.save({ validateBeforeSave: false });

  await Post.deleteOne({ _id: req.params.id });

  res.status(200).json({
    status: "success",
    message: "Post has been deleted",
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("_id name");
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (post.likes.includes(user._id)) {
    return next(new AppError("You already liked this post", 400));
  }

  createNotifications(
    [post.author],
    user._id,
    `${user.name} liked your post`,
    post._id
  );

  post.likes.push(user);
  await post.save();

  res.status(200).json({
    status: "success",
    message: "Post liked successfully",
  });
});

exports.unlikePost = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  if (!post.likes.includes(user)) {
    return next(new AppError("You have not liked this post", 400));
  }

  post.likes.pull(user);
  await post.save();

  res.status(200).json({
    status: "success",
    message: "Post unliked successfully",
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const post = await Post.findById(req.params.id)
    .populate("author", "name photo handle")
    .populate("comments.user", "name handle photo")
    .populate("comments.replies.user", "name handle photo")
    .lean();

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  post.comments.sort((a, b) => {
    const aIsUser = a.user._id.toString() === userId.toString();
    const bIsUser = b.user._id.toString() === userId.toString();

    if (aIsUser && !bIsUser) return -1;
    if (!aIsUser && bIsUser) return 1;

    return b.likes.length - a.likes.length;
  });

  const totalComments = post.comments.reduce((total, comment) => {
    return total + 1 + comment.replies.length;
  }, 0);

  res.status(200).json({
    status: "success",
    message: "Post data retrieved successfully",
    data: {
      ...post,
      totalComments,
    },
  });
});

exports.addPostComment = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("name _id");
  const post = await Post.findById(req.params.postId);

  const { comment } = req.body;

  const newComment = {
    user: user._id,
    comment,
  };

  post.comments.push(newComment);

  await post.save();

  const addedComment = await post
    .populate({
      path: "comments.user",
      select: "name _id handle photo",
      match: { _id: user._id },
    })
    .then(
      (populatedPost) =>
        populatedPost.comments[populatedPost.comments.length - 1]
    );

  const mentionedUsers = await extractAndValidateHandles(comment);

  const isAuthorMentioned = mentionedUsers.some((user) =>
    user._id.equals(post.author)
  );

  let updatedMentionedUsers = [];

  if (isAuthorMentioned) {
    updatedMentionedUsers = mentionedUsers.filter((user) => {
      return !user._id.equals(post.author);
    });
  } else {
    updatedMentionedUsers = mentionedUsers;
  }

  if (user._id.equals(post.author)) {
    // Self-comment on own post, no notification
  } else if (isAuthorMentioned) {
    createNotifications(
      [post.author],
      user._id,
      `${user.name} mentioned you in a comment on your post: ${comment}`,
      post._id
    );
  } else {
    createNotifications(
      [post.author],
      user._id,
      `${user.name} commented on your post: ${comment}`,
      post._id
    );
  }

  if (updatedMentionedUsers.length > 0) {
    createNotifications(
      updatedMentionedUsers,
      user._id,
      `${user.name} mentioned you in a comment: ${comment}`,
      post._id
    );
  }

  res.status(201).json({
    status: "success",
    message: "Comment added successfully",
    comment: addedComment,
  });
});

exports.editPostComment = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const post = await Post.findById(req.params.postId);
  const commentText = req.body.comment;

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  const comment = post.comments.find(
    (comment) => comment._id.toString() === req.params.commentId
  );

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  if (comment.user.toString() !== user._id.toString()) {
    return next(
      new AppError("You are not authorized to edit this comment", 404)
    );
  }

  comment.comment = commentText;
  comment.isEdited = true;

  await post.save();

  res.status(200).json({
    status: "success",
    message: "Comment edited successfully",
  });
});

exports.deletePostComment = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  const comment = post.comments.find(
    (comment) => comment._id.toString() === req.params.commentId
  );

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  if (
    comment.user.toString() !== post.author.toString() ||
    comment.user.toString() !== user._id.toString()
  ) {
    return next(
      new AppError("You are not authorized to delete this comment", 404)
    );
  }

  post.comments.pull(comment);
  await post.save();

  res.status(200).json({
    status: "success",
    message: "Comment deleted successfully",
  });
});

exports.likeComment = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("_id name");
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  const comment = post.comments.find(
    (comment) => comment._id.toString() === req.params.commentId
  );

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  if (comment.likes.includes(user._id)) {
    return next(new AppError("You already liked this comment", 400));
  }

  createNotifications(
    [comment.user],
    user._id,
    `${user.name} liked your comment`,
    post._id
  );

  comment.likes.push(user);
  await post.save();

  res.status(200).json({
    status: "success",
    message: "Comment liked successfully",
  });
});

exports.unlikeComment = catchAsync(async (req, res, next) => {
  const user = req.user._id;
  const post = await Post.findById(req.params.postId);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  const comment = post.comments.find(
    (comment) => comment._id.toString() === req.params.commentId
  );

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  if (!comment.likes.includes(user)) {
    return next(new AppError("You have not liked this comment", 400));
  }

  comment.likes.pull(user);
  await post.save();

  res.status(200).json({
    status: "success",
    message: "Comment unliked successfully",
  });
});

exports.addReply = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  const comment = post.comments.find(
    (comment) => comment._id.toString() === req.params.commentId
  );

  if (!comment) {
    return next(new AppError("Comment not found", 404));
  }

  const mentionedUsers = await extractAndValidateHandles(req.body.comment);

  const engagedUsers = [
    comment.user,
    ...comment.replies.map((reply) => reply.user),
  ];

  const isEngaged = (mentionedUser) =>
    engagedUsers.some((userId) => userId.equals(mentionedUser._id));

  if (mentionedUsers.length === 0) {
    createNotifications(
      [comment.user],
      user._id,
      `${user.name} replied to your comment: ${req.body.comment}`,
      post._id
    );
  } else {
    mentionedUsers.forEach((mentionedUser) => {
      if (mentionedUser._id.equals(user._id)) return;

      const message = isEngaged(mentionedUser)
        ? `${user.name} replied to your comment: ${req.body.comment}`
        : `${user.name} mentioned you in comment: ${req.body.comment}`;

      createNotifications([mentionedUser], user._id, message, post._id);
    });

    if (!mentionedUsers.some((user) => user._id.equals(comment.user))) {
      createNotifications(
        [comment.user],
        user._id,
        `${user.name} replied to your comment: ${req.body.comment}`,
        post._id
      );
    }
  }

  if (
    !post.author.equals(user._id) &&
    !mentionedUsers.some((user) => user._id.equals(post.author))
  ) {
    createNotifications(
      [post.author],
      user._id,
      `${user.name} replied to your post: ${req.body.comment}`,
      post._id
    );
  }

  const newReply = {
    user: user._id,
    comment: req.body.comment,
  };

  comment.replies.push(newReply);

  await post.save();

  const addedReply = comment.replies[comment.replies.length - 1];

  const populatedReply = await Post.populate(addedReply, {
    path: "user",
    select: "name photo handle",
  });

  res.status(200).json({
    status: "success",
    message: "Replied successfully",
    reply: populatedReply,
  });
});

exports.editReply = catchAsync(async (req, res, next) => {
  const { postId, commentId, replyId } = req.params;

  const { post, comment, reply } = await getPostCommentReply(
    postId,
    commentId,
    replyId
  );

  if (!reply.user.equals(req.user._id)) {
    return next(new AppError("You are not authorized to edit this reply", 403));
  }

  reply.comment = req.body.comment;

  await post.save();

  res.status(200).json({
    status: "success",
    message: "Reply edited successfully",
    data: {
      reply,
    },
  });
});

exports.deleteReply = catchAsync(async (req, res, next) => {
  const { postId, commentId, replyId } = req.params;

  const { post, comment, reply } = await getPostCommentReply(
    postId,
    commentId,
    replyId
  );

  if (!reply.user.equals(req.user._id)) {
    return next(
      new AppError("You are not authorized to delete this reply", 403)
    );
  }

  comment.replies.pull(reply._id);
  await post.save();

  res.status(200).json({
    status: "success",
    message: "Reply deleted successfully",
    data: {
      reply,
    },
  });
});

exports.likeReply = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { postId, commentId, replyId } = req.params;

  const { post, comment, reply } = await getPostCommentReply(
    postId,
    commentId,
    replyId
  );

  if (!reply.user.equals(req.user._id)) {
    return next(
      new AppError("You are not authorized to delete this reply", 403)
    );
  }

  if (reply.likes.includes(req.user._id)) {
    return next(new AppError("You have already liked this reply", 400));
  }

  createNotifications(
    [reply.user],
    user._id,
    `${user.name} liked your comment`,
    post._id
  );

  reply.likes.push(req.user._id);

  await post.save();

  res.status(200).json({
    status: "success",
    message: "Reply liked",
  });
});

exports.unlikeReply = catchAsync(async (req, res, next) => {
  const { postId, commentId, replyId } = req.params;

  const { post, comment, reply } = await getPostCommentReply(
    postId,
    commentId,
    replyId
  );

  if (!reply.likes.includes(req.user._id)) {
    return next(new AppError("You have not liked this reply", 400));
  }

  reply.likes.pull(req.user._id);

  await post.save();

  res.status(200).json({
    status: "success",
    message: "Reply unliked successfully",
  });
});
