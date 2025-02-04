import React, { useState, useRef } from "react";
import axios from "axios";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Posts } from "../posts/Posts";
import LoadingWave from "../common/LoadingWave";
import useScrollPosition from "../utils/useScrollPosition";

export default function Bookmarks() {
  const [options, setOptions] = useState(false);
  const queryClient = useQueryClient();

  const containerRef = useRef();
  useScrollPosition(containerRef);

  const fetchBookmarks = async ({ pageParam = 1 }) => {
    const response = await axios.get(
      `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts/bookmarks?page=${pageParam}&limit=10`,
      { withCredentials: true }
    );
    return response.data;
  };

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["bookmarks"],
      queryFn: fetchBookmarks,
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.data.bookmarks.length === 10) {
          return allPages.length + 1;
        }
        return undefined;
      },
    });

  const feedCompleteMessage = {
    message: "That's all your saved posts! Nothing more to load.",
  };

  const bookmarks =
    data?.pages.flatMap((bookmark) => bookmark.data.bookmarks) || [];

  const handleUnbookmark = (postId) => {
    queryClient.setQueryData(["bookmarks"], (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            bookmarks: page.data.bookmarks.filter(
              (post) => post._id !== postId
            ),
          },
        })),
      };
    });
  };

  return (
    <div className="bookmarks-container" ref={containerRef}>
      <div className="bookmarks-header">Bookmarks</div>
      <div className="bookmarks-body">
        {isLoading ? (
          <LoadingWave />
        ) : isError ? (
          <div className="error-message">
            Failed to load bookmarks. Try again later.
          </div>
        ) : bookmarks.length > 0 ? (
          <Posts
            postElements={bookmarks}
            options={options}
            setOptions={setOptions}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
            feedCompleteMessage={feedCompleteMessage}
            Unbookmark={handleUnbookmark}
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
