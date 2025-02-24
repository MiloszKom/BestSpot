import React, { useState, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Posts } from "../posts/Posts";
import LoadingWave from "../common/LoadingWave";
import useScrollPosition from "../hooks/useScrollPosition";
import { getBookmarks } from "../api/postsApis";

export default function Bookmarks() {
  const [options, setOptions] = useState(false);
  const containerRef = useRef();
  useScrollPosition(containerRef, "scrolledHeightBookmarks");

  const { data, isLoading, isError, error, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["bookmarks"],
      queryFn: getBookmarks,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.data.length === 10) {
          return allPages.length + 1;
        }
        return undefined;
      },
    });

  const feedCompleteMessage = {
    message: "That's all your saved posts! Nothing more to load.",
  };

  const bookmarks = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="bookmarks-container" ref={containerRef}>
      <div className="bookmarks-header">Bookmarks</div>
      <div className="bookmarks-body">
        {isLoading ? (
          <LoadingWave />
        ) : isError ? (
          <div className="general-error">
            {error.response?.data?.message || "An unexpected error occurred"}
          </div>
        ) : bookmarks.length > 0 ? (
          <Posts
            postElements={bookmarks}
            options={options}
            setOptions={setOptions}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            feedCompleteMessage={feedCompleteMessage}
          />
        ) : (
          <div className="empty-bookmarks-message">
            You haven’t saved any posts yet. Bookmark posts to view them here!
          </div>
        )}
      </div>
      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
