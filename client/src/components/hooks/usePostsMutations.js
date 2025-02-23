import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";
import {
  deletePost,
  togglePostLike,
  togglePostBookmark,
  createPost,
  addPostComment,
  deletePostComment,
  toggleCommentLike,
  editPostComment,
  addPostReply,
  deletePostReply,
} from "../api/postsApis";
import {
  updatePostAdd,
  updatePostBookmark,
  updatePostLike,
  updatePostRemove,
} from "../utils/helperFunctions";

export const usePostsMutations = () => {
  const { showAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
  const lastViewedProfile = sessionStorage.getItem("lastViewedProfile") || null;
  const currentlyViewedPost =
    sessionStorage.getItem("currentlyViewedPost") || null;
  const navigate = useNavigate();

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["posts"], (oldData) =>
        updatePostAdd(oldData, data.data)
      );
      if (data.data.author.handle === lastViewedProfile) {
        queryClient.setQueryData(
          ["profilePosts", lastViewedProfile],
          (oldData) => updatePostAdd(oldData, data.data)
        );
      }
      showAlert(data.message, data.status);
      navigate("/");
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries(["posts"]);
      await queryClient.cancelQueries(["bookmarks"]);

      const previousAllPostsData = queryClient.getQueryData(["posts"]);
      const previousAllBookmarksData = queryClient.getQueryData(["bookmarks"]);
      const previousAllProfilePostsData = queryClient.getQueryData([
        "profilePosts",
        lastViewedProfile,
      ]);

      queryClient.setQueryData(["posts"], (oldData) =>
        updatePostRemove(oldData, postId)
      );
      queryClient.setQueryData(["bookmarks"], (oldData) =>
        updatePostRemove(oldData, postId)
      );

      queryClient.setQueryData(["profilePosts", lastViewedProfile], (oldData) =>
        updatePostRemove(oldData, postId)
      );

      return {
        previousAllPostsData,
        previousAllBookmarksData,
        previousAllProfilePostsData,
      };
    },
    onError: (error, _variables, context) => {
      if (context.previousAllPostsData) {
        queryClient.setQueryData(["posts"], context.previousAllPostsData);
      }
      if (context.previousAllBookmarksData) {
        queryClient.setQueryData(
          ["bookmarks"],
          context.previousAllBookmarksData
        );
      }
      if (context.previousAllProfilePostsData) {
        queryClient.setQueryData(
          ["profilePosts", lastViewedProfile],
          context.previousAllProfilePostsData
        );
      }
      showAlert(error.response?.data?.message, error.response?.data?.status);
    },
    onSettled: (data) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries(["profilePosts", lastViewedProfile]);
    },
  });

  const togglePostLikeMutation = useMutation({
    mutationFn: togglePostLike,
    onMutate: async ({ postId, isLiked, postType }) => {
      const previousPostData = queryClient.getQueryData([
        "post",
        currentlyViewedPost,
      ]);

      if (postType) {
        await queryClient.cancelQueries(["post", currentlyViewedPost]);

        queryClient.setQueryData(["post", currentlyViewedPost], (oldData) => {
          if (!oldData) return oldData;
          const updatedData = {
            ...oldData.data,
            isLiked: !isLiked,
            likeCount: oldData.data.likeCount + (isLiked ? -1 : 1),
          };

          return {
            ...oldData,
            data: updatedData,
          };
        });
      }

      await queryClient.cancelQueries(["posts"]);
      await queryClient.cancelQueries(["bookmarks"]);
      await queryClient.cancelQueries(["profilePosts", lastViewedProfile]);

      const previousAllPostsData = queryClient.getQueryData(["posts"]);
      const previousAllBookmarksData = queryClient.getQueryData(["bookmarks"]);
      const previousAllProfilePostsData = queryClient.getQueryData([
        "profilePosts",
        lastViewedProfile,
      ]);

      queryClient.setQueryData(["posts"], (oldData) =>
        updatePostLike(oldData, postId, isLiked)
      );
      queryClient.setQueryData(["bookmarks"], (oldData) =>
        updatePostLike(oldData, postId, isLiked)
      );
      queryClient.setQueryData(["profilePosts", lastViewedProfile], (oldData) =>
        updatePostLike(oldData, postId, isLiked)
      );

      return {
        previousPostData,
        previousAllPostsData,
        previousAllBookmarksData,
        previousAllProfilePostsData,
      };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        ["post", currentlyViewedPost],
        context.previousPostData
      );
      queryClient.setQueryData(["posts"], context.previousPostData);

      showAlert(error.response?.data?.message, error.response?.data?.status);
    },
  });

  const togglePostBookmarkMutation = useMutation({
    mutationFn: togglePostBookmark,
    onMutate: async ({ postId, isBookmarked, postType, post }) => {
      const previousPostData = queryClient.getQueryData([
        "post",
        currentlyViewedPost,
      ]);

      if (postType) {
        await queryClient.cancelQueries(["post", currentlyViewedPost]);

        queryClient.setQueryData(["post", currentlyViewedPost], (oldData) => {
          if (!oldData) return oldData;
          const updatedData = {
            ...oldData.data,
            isBookmarked: !isBookmarked,
            bookmarkCount: oldData.data.bookmarkCount + (isBookmarked ? -1 : 1),
          };

          return {
            ...oldData,
            data: updatedData,
          };
        });
      }

      await queryClient.cancelQueries(["posts"]);
      await queryClient.cancelQueries(["bookmarks"]);
      await queryClient.cancelQueries(["profilePosts", lastViewedProfile]);

      const previousAllPostsData = queryClient.getQueryData(["posts"]);
      const previousAllBookmarksData = queryClient.getQueryData(["bookmarks"]);
      const previousAllProfilePostsData = queryClient.getQueryData([
        "profilePosts",
        lastViewedProfile,
      ]);

      queryClient.setQueryData(["posts"], (oldData) =>
        updatePostBookmark(oldData, postId, isBookmarked, "posts")
      );
      queryClient.setQueryData(["bookmarks"], (oldData) =>
        updatePostBookmark(oldData, postId, isBookmarked, "bookmarks", post)
      );
      queryClient.setQueryData(["profilePosts", lastViewedProfile], (oldData) =>
        updatePostBookmark(oldData, postId, isBookmarked)
      );

      return {
        previousPostData,
        previousAllPostsData,
        previousAllBookmarksData,
        previousAllProfilePostsData,
      };
    },
    onError: (error, _variables, context) => {
      queryClient.setQueryData(
        ["post", currentlyViewedPost],
        context.previousPostData
      );
      showAlert(error.response?.data?.message, error.response?.data?.status);
    },
  });

  const addPostCommentMutation = useMutation({
    mutationFn: addPostComment,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["post", currentlyViewedPost]);
      showAlert(data.message, data.status);
    },
  });

  const editPostCommentMutation = useMutation({
    mutationFn: editPostComment,
    onError: (error) => {
      showAlert(error.response?.data?.message, error.response?.data?.status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["post", currentlyViewedPost]);
      showAlert(data.message, data.status);
    },
  });

  const deletePostCommentMutation = useMutation({
    mutationFn: deletePostComment,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["post", currentlyViewedPost]);
      showAlert(data.message, data.status);
    },
  });

  const toggleCommentLikeMutation = useMutation({
    mutationFn: toggleCommentLike,
    onMutate: async ({ commentId, replyId, isLiked, userData }) => {
      await queryClient.cancelQueries(["post"]);

      queryClient.setQueryData(["post", currentlyViewedPost], (oldData) => {
        if (!oldData) return oldData;

        const updatedData = {
          ...oldData.data,
          comments: oldData.data.comments.map((comment) => {
            if (comment._id === commentId) {
              if (replyId) {
                return {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply._id === replyId
                      ? {
                          ...reply,
                          likes: isLiked
                            ? reply.likes.filter(
                                (like) => like._id !== userData._id
                              )
                            : [
                                ...reply.likes,
                                { _id: userData._id, isLikeActive: true },
                              ],
                        }
                      : reply
                  ),
                };
              } else {
                return {
                  ...comment,
                  likes: isLiked
                    ? comment.likes.filter((like) => like._id !== userData._id)
                    : [
                        ...comment.likes,
                        { _id: userData._id, isLikeActive: true },
                      ],
                };
              }
            }
            return comment;
          }),
        };

        return {
          ...oldData,
          data: updatedData,
        };
      });
    },
    onError: (error) => {
      showAlert(error.response?.data?.message, error.response?.data?.status);
    },
  });

  const addPostReplyMutation = useMutation({
    mutationFn: addPostReply,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["post", currentlyViewedPost]);
      showAlert(data.message, data.status);
    },
  });

  const deletePostReplyMutation = useMutation({
    mutationFn: deletePostReply,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["post", currentlyViewedPost]);
      showAlert(data.message, data.status);
    },
  });

  return {
    createPostMutation,
    deletePostMutation,
    togglePostLikeMutation,
    togglePostBookmarkMutation,
    addPostCommentMutation,
    editPostCommentMutation,
    deletePostCommentMutation,
    toggleCommentLikeMutation,
    addPostReplyMutation,
    deletePostReplyMutation,
  };
};
