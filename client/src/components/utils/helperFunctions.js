import { Link } from "react-router-dom";
import {
  faLock,
  faEarthAmericas,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

import axios from "axios";

export function measureDistance(position1, position2) {
  const R = 6371e3;
  const φ1 = (position1.lat * Math.PI) / 180;
  const φ2 = (position2.lat * Math.PI) / 180;
  const Δφ = ((position2.lat - position1.lat) * Math.PI) / 180;
  const Δλ = ((position2.lng - position1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;

  return d;
}

export const formatTime = (date) => {
  const time = new Date(date);
  const year = String(time.getFullYear());
  const month = String(time.getMonth() + 1).padStart(2, "0");
  const day = String(time.getDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
};

export const compareTime = (date1, date2) => {
  if (date1.split("/")[0] > date2.split("/")[0]) {
    return true;
  } else if (date1.split("/")[1] > date2.split("/")[1]) {
    return true;
  } else if (date1.split("/")[2 > date2.split("/")[2]]) {
    return true;
  } else {
    return false;
  }
};

export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const timeDiff = now - new Date(timestamp);
  const seconds = Math.max(0, Math.floor(timeDiff / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(timestamp).toLocaleDateString(undefined, options);
};

export function formatPostTimestamp(timestamp) {
  const date = new Date(timestamp);

  const options = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const time = new Intl.DateTimeFormat("en-US", options).format(date);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${time} · ${month} ${day}, ${year}`;
}

export const getVisibilityDisplayName = (visibility) => {
  const visibilityMap = {
    private: "Private",
    public: "Public",
    "friends-only": "Friends only",
  };

  return visibilityMap[visibility] || "Unknown";
};

export const logout = async (auth) => {
  try {
    const res = await axios({
      method: "GET",
      url: `${process.env.REACT_APP_API_URL}/api/v1/users/auth/logout`,
      withCredentials: true,
    });
    auth.logout();
    if ((res.data.status = "success")) window.location.href = "/login";
  } catch (err) {
    // console.log(err);
  }
};

export const fetchUserLocation = async () => {
  try {
    const response = await fetch(
      "https://geolocation-db.com/json/2ed7dd60-d220-11ef-82fe-157c1da7bc7e"
    );
    const data = await response.json();
    return {
      lat: data.latitude,
      lng: data.longitude,
    };
  } catch (error) {
    console.error("Error fetching user location:", error);
    return null;
  }
};

export const categoryMap = {
  All: "all",
  "Food & Drink": "food-drink",
  "Nature & Outdoors": "nature-outdoors",
  "Arts & Culture": "arts-culture",
  Shopping: "shopping",
  Nightlife: "nightlife",
  Relaxation: "relaxation",
  Adventure: "adventure",
  "Hidden Gems": "hidden-gems",
  Historical: "historical",
  "Photography Spots": "photography-spots",
  Wellness: "wellness",
  "Events & Festivals": "events-festivals",
  Miscellaneous: "miscellaneous",
};

export const reverseCategoryMap = Object.fromEntries(
  Object.entries(categoryMap).map(([displayName, internalValue]) => [
    internalValue,
    displayName,
  ])
);

export const convertCategory = (displayName) => {
  return categoryMap[displayName] || "miscellaneous";
};

export const convertToDisplayName = (internalValue) => {
  return reverseCategoryMap[internalValue] || "Miscellaneous";
};

export function getZoomLevel(radius) {
  if (radius >= 1000 && radius < 2000) {
    return 15;
  } else if (radius >= 2000 && radius < 3000) {
    return 14;
  } else if (radius >= 3000 && radius < 4000) {
    return 13;
  } else if (radius >= 4000 && radius < 6000) {
    return 12.5;
  } else if (radius >= 6000 && radius < 8000) {
    return 12;
  } else if (radius >= 8000 && radius <= 10000) {
    return 11.5;
  } else {
    return 10;
  }
}

export function highlightHandles(str) {
  const wordsWithSpaces = str.split(/(\s+)/);

  const highlightedWords = wordsWithSpaces.map((part, index) => {
    if (part.startsWith("@")) {
      return (
        <Link
          to={`/${part.substring(1)}`}
          key={index}
          className="handle-highlight"
        >
          {part}
        </Link>
      );
    }
    return part;
  });

  return <>{highlightedWords}</>;
}

export const getVisibilityIcon = (visibility) => {
  switch (visibility) {
    case "private":
      return faLock;
    case "public":
      return faEarthAmericas;
    case "friends-only":
      return faUsers;
    default:
      return null;
  }
};

export const moveHighlightedItemToTop = (data, arrayKey, highlightedId) => {
  if (data && highlightedId) {
    const array = data.data[arrayKey];
    const highlightedIndex = array.findIndex(
      (item) => item._id === highlightedId
    );

    if (highlightedIndex !== -1) {
      const [highlightedItem] = array.splice(highlightedIndex, 1);
      array.unshift(highlightedItem);
      data.data[arrayKey] = array;
    }
  }
};

export const suppressConsoleInfo = () => {
  const originalConsoleInfo = console.info;

  console.info = (...args) => {
    const message = args.join(" ");
    if (!message.includes("By not specifying 'modelOrUrl' parameter")) {
      originalConsoleInfo.apply(console, args);
    }
  };
};

// Post mutation helper functions

export const updatePostLike = (oldData, postId, isLiked) => {
  if (!oldData || !oldData.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.map((post) =>
        post._id === postId
          ? {
              ...post,
              isLiked: !isLiked,
              likeCount: post.likeCount + (isLiked ? -1 : 1),
            }
          : post
      ),
    })),
  };
};

export const updatePostBookmark = (
  oldData,
  postId,
  isBookmarked,
  queryKey,
  newPost
) => {
  if (!oldData || !oldData.pages) return oldData;

  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data:
        queryKey === "bookmarks"
          ? isBookmarked
            ? page.data.filter((post) => post._id !== postId)
            : [{ ...newPost, isBookmarked: true }, ...page.data]
          : page.data.map((post) =>
              post._id === postId
                ? {
                    ...post,
                    isBookmarked: !isBookmarked,
                    bookmarkCount: post.bookmarkCount + (isBookmarked ? -1 : 1),
                  }
                : post
            ),
    })),
  };
};

export const updatePostRemove = (oldData, postId) => {
  if (!oldData || !oldData.pages) return oldData;
  return {
    ...oldData,
    pages: oldData.pages.map((page) => ({
      ...page,
      data: page.data.filter((post) => post._id !== postId),
    })),
  };
};

export const updatePostAdd = (oldData, newPost, queryKey) => {
  if (!oldData || !oldData.pages) return oldData;
  return {
    ...oldData,
    pages: oldData.pages.map((page, index) => {
      if (index === 0) {
        return {
          ...page,
          data: [newPost, ...page.data],
        };
      }
      return page;
    }),
  };
};
