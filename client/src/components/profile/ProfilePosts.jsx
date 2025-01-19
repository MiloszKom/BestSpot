import React from "react";
import { useOutletContext } from "react-router-dom";

import { Posts } from "../posts/Posts";

export function ProfilePosts() {
  const { posts, options, setOptions } = useOutletContext();

  return (
    <div className="posts-container">
      <Posts postElements={posts} options={options} setOptions={setOptions} />
    </div>
  );
}
