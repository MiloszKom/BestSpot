const express = require("express");

const postController = require("../controllers/postController");
const { protect, softAuth } = require("./../controllers/authController");

const router = express.Router();

const {
  uploadPostPhotos,
  initializePostPhotos,
} = require("../utils/multerConfig");

router
  .route("/")
  .get(softAuth, postController.getPosts)
  .post(
    protect,
    uploadPostPhotos,
    initializePostPhotos,
    postController.createPost
  );

router.get("/bookmarks", protect, postController.getUserBookmarks);

router.get("/:id", softAuth, postController.getPost);
router.delete("/:id", protect, postController.deletePost);

router
  .route("/:id/like")
  .post(protect, postController.likePost)
  .delete(protect, postController.unlikePost);

router
  .route("/:id/bookmark")
  .post(protect, postController.bookmarkPost)
  .delete(protect, postController.unbookmarkPost);

router.post("/:postId/comment", protect, postController.addPostComment);

router
  .route("/:postId/comments/:commentId")
  .patch(protect, postController.editPostComment)
  .delete(protect, postController.deletePostComment);

router
  .route("/:postId/comments/:commentId/like")
  .post(protect, postController.likeComment)
  .delete(protect, postController.unlikeComment);

router.post(
  "/:postId/comments/:commentId/replies",
  protect,
  postController.addReply
);

router
  .route("/:postId/comments/:commentId/replies/:replyId")
  .patch(protect, postController.editReply)
  .delete(protect, postController.deleteReply);

router
  .route("/:postId/comments/:commentId/replies/:replyId/like")
  .post(protect, postController.likeReply)
  .delete(protect, postController.unlikeReply);

module.exports = router;
