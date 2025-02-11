import React from "react";

import { useQuery } from "@tanstack/react-query";
import { searchUsersByHandle } from "../../api/userApis";
import LoadingWave from "../../common/LoadingWave";

export default function PostTagging({ taggedWord, handleTagCompletion }) {
  const { data, isLoading } = useQuery({
    queryKey: ["taggingResults", taggedWord],
    queryFn: () => searchUsersByHandle(taggedWord),
    enabled: taggedWord.length > 0,
  });

  const users = data?.users;

  return (
    <div className="post-tagging-container">
      {taggedWord.length === 0 ? (
        <div className="post-tagging-message">Start typing to tag someone</div>
      ) : isLoading ? (
        <div className="post-tagging-message">
          <LoadingWave />
        </div>
      ) : users.length === 0 ? (
        <div className="post-tagging-message">No matching users found</div>
      ) : (
        users.map((user) => (
          <div
            className="post-tag-el"
            key={user._id}
            onClick={() => handleTagCompletion(user.handle)}
          >
            <div
              className="profile-icon"
              style={{
                backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${user.photo})`,
              }}
            ></div>
            <div className="post-tag-name">{user.name}</div>
            <div className="post-tag-handle">@{user.handle}</div>
          </div>
        ))
      )}
    </div>
  );
}
