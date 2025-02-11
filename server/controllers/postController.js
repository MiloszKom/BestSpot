const Post = require("./../models/postModel");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");

const {
  getPostCommentReply,
  createNotifications,
  likeEntity,
  unlikeEntity,
} = require("../utils/helpers");

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

const extractAndValidateHandles = async (content) => {
  const handlePattern = /@([a-zA-Z0-9_]{3,30})/g;
  const handles = [];
  let match;

  while ((match = handlePattern.exec(content)) !== null) {
    handles.push(match[1]);
  }

  if (handles.length === 0) return [];

  const validUsers = await User.find({ handle: { $in: handles } }, "_id");

  return validUsers.map((user) => user._id.toString());
};

exports.getPosts = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  const userId = req.user?._id;

  let filter = {};

  if (req.query.filter === "friends") {
    const user = await User.findById(userId).select("friends");
    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    filter = { author: { $in: user.friends } };
  }

  const posts = await Post.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate([
      { path: "author", select: "_id name photo handle" },
      { path: "spotlists", select: "_id name cover visibility spots author" },
      { path: "spots", select: "_id name photo city country" },
    ]);

  const formattedPosts = posts.map((post) => {
    const likeCount = post.likes.filter((like) => like.isLikeActive).length;
    const isLiked = post.likes.some(
      (like) => like._id.toString() === userId?.toString() && like.isLikeActive
    );
    const bookmarkCount = post.bookmarks.filter(
      (bookmark) => bookmark.isLikeActive
    ).length;
    const isBookmarked = post.bookmarks.some(
      (bookmark) =>
        bookmark._id.toString() === userId?.toString() && bookmark.isLikeActive
    );

    return {
      ...post.toObject(),
      likeCount,
      isLiked,
      bookmarkCount,
      isBookmarked,
    };
  });

  res.status(200).json({
    status: "success",
    data: formattedPosts,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("friends", "_id");

  const { visibility, content, spots, spotlists, photos } = req.body;

  if (!user) {
    return next(new AppError("No user found", 404));
  }

  const fields = [spots, spotlists, photos];
  const nonEmptyFields = fields.filter((field) => field && field.length > 0);

  if (nonEmptyFields.length > 1) {
    return next(
      new AppError(
        "You can include only one of spots, spotlists, or photos",
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

  const userFriends = user.friends.map((friend) => friend._id.toString());
  const mentions = await extractAndValidateHandles(content);
  const nonMentionedFriends = userFriends.filter(
    (friend) => !mentions.includes(friend)
  );

  const newPost = await Post.create({
    author: user._id,
    visibility,
    content,
    spots,
    spotlists,
    photos: photos ? photos : null,
  });

  user.posts.unshift(newPost._id);
  await user.save({ validateBeforeSave: false });

  const originDetails = {
    author: user._id,
    postId: newPost._id,
  };

  if (nonMentionedFriends.length > 0) {
    createNotifications(
      nonMentionedFriends,
      user._id,
      newPost.content,
      originDetails,
      `${user.name} created a new post`
    );
  }

  if (mentions.length > 0) {
    createNotifications(
      mentions,
      user._id,
      newPost.content,
      originDetails,
      `${user.name} mentioned you in their post`
    );
  }

  const populatedPost = await Post.findById(newPost._id).populate([
    { path: "author", select: "_id name photo handle" },
    { path: "spotlists", select: "_id name cover visibility spots author" },
    { path: "spots", select: "_id name photo city country" },
  ]);

  const responsePost = populatedPost.toObject();

  responsePost.likeCount = 0;
  responsePost.bookmarkCount = 0;
  responsePost.isLiked = false;
  responsePost.isBookmarked = false;

  res.status(201).json({
    status: "success",
    message: "Post has been created",
    data: responsePost,
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

  await User.updateMany(
    { bookmarks: post._id },
    { $pull: { bookmarks: post._id } }
  );

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

  await likeEntity(user, post, "post");

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

  await unlikeEntity(user, post, "post");

  res.status(200).json({
    status: "success",
    message: "Post unliked successfully",
  });
});

exports.getUserBookmarks = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const user = await User.findById(req.user._id).populate({
    path: "bookmarks",
    options: { skip, limit },
    populate: [
      { path: "author", select: "_id name photo handle" },
      { path: "spotlists", select: "_id name cover visibility spots author" },
      { path: "spots", select: "_id name photo city country" },
    ],
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const formattedBookmarks = user.bookmarks.map((post) => {
    const likeCount = post.likes.filter((like) => like.isLikeActive).length;
    const isLiked = post.likes.some(
      (like) => like._id.toString() === user._id.toString() && like.isLikeActive
    );
    const bookmarkCount = post.bookmarks.filter(
      (bookmark) => bookmark.isLikeActive
    ).length;
    const isBookmarked = post.bookmarks.some(
      (bookmark) =>
        bookmark._id.toString() === user._id.toString() && bookmark.isLikeActive
    );

    return {
      ...post.toObject(),
      likeCount,
      isLiked,
      bookmarkCount,
      isBookmarked,
    };
  });

  res.status(200).json({
    status: "success",
    data: formattedBookmarks,
  });
});

exports.bookmarkPost = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("_id name");
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  const existingBookmark = post.bookmarks.find((bookmarks) =>
    bookmarks._id.equals(user._id)
  );

  if (existingBookmark) {
    if (existingBookmark.isLikeActive) {
      return next(new AppError(`You already bookmarked this post`, 400));
    }
    existingBookmark.isLikeActive = true;
  } else {
    post.bookmarks.push({ _id: user._id, isLikeActive: true });
  }

  await User.findByIdAndUpdate(user._id, {
    $push: { bookmarks: { $each: [post._id], $position: 0 } },
  });

  post.save();

  res.status(200).json({
    status: "success",
    message: "Added to your bookmarks",
  });
});

exports.unbookmarkPost = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("_id name");
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError("Post not found", 404));
  }

  const existingBookmark = post.bookmarks.find((bookmark) =>
    bookmark._id.equals(user._id)
  );

  if (!existingBookmark || !existingBookmark.isLikeActive) {
    return next(new AppError(`You have not saved this bookmark`, 400));
  }

  existingBookmark.isLikeActive = false;

  await User.findByIdAndUpdate(user._id, {
    $pull: { bookmarks: post._id },
  });

  post.save();

  res.status(200).json({
    status: "success",
    message: "Removed from your bookmarks",
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const post = await Post.findById(req.params.id)
    .populate("author", "_id name photo handle")
    .populate("spots", "_id name photo city country ")
    .populate("spotlists", "_id name cover visibility spots")
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

  const likeCount = post.likes.filter((like) => like.isLikeActive).length;
  const isLiked = post.likes.some(
    (like) => like._id.toString() === userId?.toString() && like.isLikeActive
  );
  const bookmarkCount = post.bookmarks.filter(
    (bookmark) => bookmark.isLikeActive
  ).length;
  const isBookmarked = post.bookmarks.some(
    (bookmark) =>
      bookmark._id.toString() === userId?.toString() && bookmark.isLikeActive
  );

  res.status(200).json({
    status: "success",
    message: "Post data retrieved successfully",
    data: {
      ...post,
      totalComments,
      likeCount,
      isLiked,
      bookmarkCount,
      isBookmarked,
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

  const createdComment = post.comments[post.comments.length - 1];

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

  const originDetails = {
    author: post.author,
    postId: post._id,
    commentId: createdComment._id,
  };

  const mentionedUsers = await extractAndValidateHandles(comment);

  if (user._id.equals(post.author)) {
    // Self-comment on own post, no notification
  } else if (
    mentionedUsers.some((mentionedUser) =>
      mentionedUser._id.equals(post.author)
    )
  ) {
    createNotifications(
      [post.author],
      user._id,
      newComment.comment,
      originDetails,
      `${user.name} mentioned you in a comment on your post`
    );
  } else {
    createNotifications(
      [post.author],
      user._id,
      newComment.comment,
      originDetails,
      `${user.name} commented on your post`
    );
  }

  const filteredMentionedUsers = mentionedUsers.filter(
    (mentionedUser) => mentionedUser !== post.author.toString()
  );

  if (filteredMentionedUsers.length > 0) {
    createNotifications(
      filteredMentionedUsers,
      user._id,
      newComment.comment,
      originDetails,
      `${user.name} mentioned you in a comment`
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

  const originDetails = {
    author: post.author,
    postId: post._id,
    commentId: comment._id,
  };

  const existingLike = comment.likes.find((like) => like._id.equals(user._id));
  let activeLikesCount = comment.likes.filter(
    (like) => like.isLikeActive
  ).length;

  if (existingLike) {
    if (existingLike.isLikeActive) {
      return next(new AppError("You already liked this comment", 400));
    }
    existingLike.isLikeActive = true;
    activeLikesCount++;
  } else {
    comment.likes.push({ _id: user._id, isLikeActive: true });
    activeLikesCount++;

    if (activeLikesCount <= 2 && !comment.user.equals(user._id)) {
      await createNotifications(
        [comment.user],
        user._id,
        comment.comment,
        originDetails,
        `${user.name} liked your comment`
      );
    }
  }

  const thresholds = [3, 5, 10, 20, 50, 100, 200, 500, 1000];

  if (
    thresholds.includes(activeLikesCount) &&
    !comment.thresholdsReached.includes(activeLikesCount)
  ) {
    createNotifications(
      [comment.user],
      null,
      comment.comment,
      originDetails,
      `Your comment reached ${activeLikesCount} likes`
    );

    comment.thresholdsReached.push(activeLikesCount);
  }

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

  const existingLike = comment.likes.find((like) => like._id.equals(user._id));

  if (!existingLike || !existingLike.isLikeActive) {
    return next(new AppError("You have not liked this comment", 400));
  }

  existingLike.isLikeActive = false;
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

  const newReply = {
    user: user._id,
    comment: req.body.comment,
  };

  comment.replies.push(newReply);

  await post.save();

  const addedReply = comment.replies[comment.replies.length - 1];

  const originDetails = {
    author: post.author,
    postId: post._id,
    commentId: comment._id,
    replyId: addedReply._id,
  };

  const mentionedUsers = await extractAndValidateHandles(req.body.comment);

  const engagedUsers = Array.from(
    new Set([
      comment.user.toString(),
      ...comment.replies.map((reply) => reply.user.toString()),
    ])
  );

  let mentionedEngagedUsers = mentionedUsers.filter((user) =>
    engagedUsers.includes(user)
  );
  const mentionedUnengagedUsers = mentionedUsers.filter(
    (user) => !engagedUsers.includes(user)
  );

  if (!mentionedEngagedUsers.includes(comment.user.toString()))
    mentionedEngagedUsers.push(comment.user.toString());

  if (user._id.toString() === comment.user.toString()) {
    mentionedEngagedUsers = mentionedEngagedUsers.filter(
      (user) => user !== comment.user.toString()
    );
  }

  createNotifications(
    mentionedEngagedUsers,
    user._id,
    req.body.comment,
    originDetails,
    `${user.name} replied to your comment`
  );

  if (mentionedUnengagedUsers.length > 0) {
    createNotifications(
      mentionedUnengagedUsers,
      user._id,
      req.body.comment,
      originDetails,
      `${user.name} mentioned you in a reply`
    );
  }

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

  const originDetails = {
    author: post.author,
    postId: post._id,
    commentId: comment._id,
    replyId: reply._id,
  };

  const existingLike = reply.likes.find((like) => like._id.equals(user._id));
  let activeLikesCount = reply.likes.filter((like) => like.isLikeActive).length;

  if (existingLike) {
    if (existingLike.isLikeActive) {
      return next(new AppError("You already liked this reply", 400));
    }
    existingLike.isLikeActive = true;
    activeLikesCount++;
  } else {
    reply.likes.push({ _id: user._id, isLikeActive: true });
    activeLikesCount++;

    if (activeLikesCount <= 2 && !reply.user.equals(user._id)) {
      createNotifications(
        [reply.user],
        user._id,
        reply.comment,
        originDetails,
        `${user.name} liked your reply`
      );
    }
  }

  const thresholds = [3, 5, 10, 20, 50, 100, 200, 500, 1000];

  if (
    thresholds.includes(activeLikesCount) &&
    !reply.thresholdsReached.includes(activeLikesCount)
  ) {
    createNotifications(
      [reply.user],
      null,
      reply.comment,
      originDetails,
      `Your reply reached ${activeLikesCount} likes`
    );

    reply.thresholdsReached.push(activeLikesCount);
  }

  await post.save();

  res.status(200).json({
    status: "success",
    message: "Reply liked",
  });
});

exports.unlikeReply = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const { postId, commentId, replyId } = req.params;

  const { post, comment, reply } = await getPostCommentReply(
    postId,
    commentId,
    replyId
  );

  const existingLike = reply.likes.find((like) => like._id.equals(user._id));

  if (!existingLike || !existingLike.isLikeActive) {
    return next(new AppError("You have not liked this reply", 400));
  }

  existingLike.isLikeActive = false;
  await post.save();

  res.status(200).json({
    status: "success",
    message: "Reply unliked successfully",
  });
});
