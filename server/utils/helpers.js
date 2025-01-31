const AppError = require("./appError");
const Post = require("../models/postModel");
const User = require("../models/userModel");

async function getPostCommentReply(postId, commentId, replyId) {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const comment = post.comments.find(
    (comment) => comment._id.toString() === commentId
  );
  if (!comment) {
    throw new AppError("Comment not found", 404);
  }

  const reply = comment.replies.find(
    (reply) => reply._id.toString() === replyId
  );
  if (!reply) {
    throw new AppError("Reply not found", 404);
  }

  return { post, comment, reply };
}

const createNotifications = async (
  notifiedUsers,
  sender,
  message,
  originDetails,
  title
) => {
  const notification = {
    sender,
    message,
    originDetails,
    title,
  };

  const updatePromises = notifiedUsers.map((userId) =>
    User.findByIdAndUpdate(
      userId,
      {
        $push: {
          notifications: {
            $each: [notification],
            $position: 0,
          },
        },
      },
      { new: true }
    )
  );

  await Promise.all(updatePromises);
};

const likeEntity = async (user, entityObject, entityName) => {
  const originDetails = {
    author: entityObject.author,
    [`${entityName}Id`]: entityObject._id,
  };

  const existingLike = entityObject.likes.find((like) =>
    like._id.equals(user._id)
  );
  let activeLikesCount = entityObject.likes.filter(
    (like) => like.isLikeActive
  ).length;

  const notificationReciever = [entityObject.author];
  const notificationSender = user._id;
  const notificationDetils = entityObject.content ? entityObject.content : "";

  if (existingLike) {
    if (existingLike.isLikeActive) {
      return next(new AppError(`You already liked this ${entityName}`, 400));
    }
    existingLike.isLikeActive = true;
    activeLikesCount++;
  } else {
    entityObject.likes.push({ _id: user._id, isLikeActive: true });
    activeLikesCount++;

    if (activeLikesCount <= 2 && !entityObject.author.equals(user._id)) {
      await createNotifications(
        notificationReciever,
        notificationSender,
        notificationDetils,
        originDetails,
        `${user.name} liked your ${entityName}`
      );
    }
  }

  const thresholds = [3, 5, 10, 20, 50, 100, 200, 500, 1000];

  if (
    thresholds.includes(activeLikesCount) &&
    !entityObject.thresholdsReached.includes(activeLikesCount)
  ) {
    await createNotifications(
      notificationReciever,
      null,
      notificationDetils,
      originDetails,
      `Your ${entityName} reached ${activeLikesCount} likes`
    );

    entityObject.thresholdsReached.push(activeLikesCount);
  }

  entityObject.save();
};

const unlikeEntity = async (user, entityObject, entityName) => {
  const existingLike = entityObject.likes.find((like) =>
    like._id.equals(user._id)
  );

  if (!existingLike || !existingLike.isLikeActive) {
    return next(new AppError(`You have not liked this ${entityName}`, 400));
  }

  existingLike.isLikeActive = false;
  await entityObject.save();

  entityObject.save();
};

module.exports = {
  getPostCommentReply,
  createNotifications,
  likeEntity,
  unlikeEntity,
};
