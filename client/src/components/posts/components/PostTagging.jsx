import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PostTagging({ taggedWord, handleTagCompletion }) {
  const [users, setUsers] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setApiLoading(true);
      try {
        const res = await axios({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/searchHandles?q=${taggedWord}`,
          withCredentials: true,
        });
        setUsers(res.data.users);
      } catch (error) {
        console.error("Error fetching search results", error);
      }
      setApiLoading(false);
    };

    if (taggedWord.length > 0) fetchUsers();
    else setUsers([]);
  }, [taggedWord]);

  return (
    <div className="post-tagging-container">
      {taggedWord.length === 0 ? (
        <div className="post-tagging-message">Start typing to tag someone</div>
      ) : apiLoading ? (
        <div className="post-tagging-message">Loading...</div>
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
