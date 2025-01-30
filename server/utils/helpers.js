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

module.exports = { getPostCommentReply, createNotifications };
