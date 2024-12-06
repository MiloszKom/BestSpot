const AppError = require("./appError");
const Post = require("../models/postModel");

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

module.exports = { getPostCommentReply };
