const express = require("express");

const postController = require("../controllers/postController");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/", authController.protect, postController.getPosts);
router.get(
  "/bookmarks",
  authController.protect,
  postController.getUserBookmarks
);
router.post(
  "/",
  authController.protect,
  postController.uploadPostPhotos,
  postController.resizePostPhotos,
  postController.uploadErrorHandler,
  postController.createPost
);

router.get("/:id", authController.protect, postController.getPost);
router.delete("/:id", authController.protect, postController.deletePost);

router
  .route("/:id/like")
  .post(authController.protect, postController.likePost)
  .delete(authController.protect, postController.unlikePost);

router
  .route("/:id/bookmark")
  .post(authController.protect, postController.bookmarkPost)
  .delete(authController.protect, postController.unbookmarkPost);

router.post(
  "/:postId/comment",
  authController.protect,
  postController.addPostComment
);

router
  .route("/:postId/comments/:commentId")
  .patch(authController.protect, postController.editPostComment)
  .delete(authController.protect, postController.deletePostComment);

router
  .route("/:postId/comments/:commentId/like")
  .post(authController.protect, postController.likeComment)
  .delete(authController.protect, postController.unlikeComment);

router.post(
  "/:postId/comments/:commentId/replies",
  authController.protect,
  postController.addReply
);

router
  .route("/:postId/comments/:commentId/replies/:replyId")
  .patch(authController.protect, postController.editReply)
  .delete(authController.protect, postController.deleteReply);

router
  .route("/:postId/comments/:commentId/replies/:replyId/like")
  .post(authController.protect, postController.likeReply)
  .delete(authController.protect, postController.unlikeReply);

module.exports = router;
