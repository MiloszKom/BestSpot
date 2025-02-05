import React from "react";
import { useOutletContext } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Posts } from "../posts/Posts";
import axios from "axios";
import LoadingWave from "../common/LoadingWave";

export function ProfilePosts() {
  const { user, userData, options, setOptions } = useOutletContext();

  const fetchProfilePosts = async ({ pageParam = 1 }) => {
    const response = await axios.get(
      `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/${user.handle}/posts?page=${pageParam}&limit=10`,
      { withCredentials: true }
    );
    return response.data;
  };

  const {
    data: postsData,
    isLoading: isPostsLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["profilePosts", user.handle],
    queryFn: fetchProfilePosts,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.length === 10) {
        return allPages.length + 1;
      }
      return undefined;
    },
    enabled: !!user,
  });

  const feedCompleteMessage = {
    message: `End of ${user.name}'s posts`,
  };

  const posts = postsData?.pages.flatMap((post) => post.data) || [];

  if (isPostsLoading) return <LoadingWave />;

  return (
    <div className="profile-posts-container">
      {posts.length > 0 ? (
        <Posts
          postElements={posts}
          options={options}
          setOptions={setOptions}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
          feedCompleteMessage={feedCompleteMessage}
        />
      ) : (
        <div className="empty-profile-message">
          {userData._id === user._id
            ? "Your profile is looking a little empty. Start posting and let others see your favorite places!"
            : `Looks like @${user.handle} hasn’t posted anything yet.`}
        </div>
      )}
    </div>
  );
}
