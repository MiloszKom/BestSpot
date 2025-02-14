import React from "react";
import { useOutletContext } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Posts } from "../posts/Posts";
import { getProfilePosts } from "../api/profileApis";
import LoadingWave from "../common/LoadingWave";

export function ProfilePosts() {
  const { user, userData, options, setOptions } = useOutletContext();
  const lastViewedProfile = sessionStorage.getItem("lastViewedProfile") || null;

  const {
    data: postsData,
    isLoading: isPostsLoading,
    hasNextPage,
    fetchNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey: [`profilePosts`, user.handle],
    queryFn: ({ pageParam = 1 }) => getProfilePosts(user.handle, pageParam),
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

  if (lastViewedProfile !== user.handle) {
    if (isFetching) return <LoadingWave />;
  }

  const posts = postsData?.pages.flatMap((post) => post.data) || [];
  sessionStorage.setItem("lastViewedProfile", user.handle);

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
          {userData?._id === user._id
            ? "Your profile is looking a little empty. Start posting and let others see your favorite places!"
            : `Looks like @${user.handle} hasn’t posted anything yet.`}
        </div>
      )}
    </div>
  );
}
