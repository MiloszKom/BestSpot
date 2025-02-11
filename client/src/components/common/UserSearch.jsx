import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useQuery } from "@tanstack/react-query";
import { searchUsers } from "../api/userApis";
import LoadingWave from "./LoadingWave";

export default function UserSearch() {
  const [chatSearch, setChatSearch] = useState("");
  const auth = useContext(AuthContext);

  const navigate = useNavigate();

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["searchResults", chatSearch],
    queryFn: () => searchUsers(chatSearch),
    enabled: chatSearch.length > 0,
  });

  const friends = searchResults.filter((el) =>
    el.friends.includes(auth.userData._id)
  );
  const others = searchResults.filter(
    (el) => !el.friends.includes(auth.userData._id)
  );

  const renderSearchResults = (users, title) => {
    if (users.length > 0) {
      return (
        <>
          <div className="chat-search-results-title">{title}</div>
          {users.map((el) => (
            <Link
              to={`/${el.handle}`}
              className="chat-search-results-el"
              key={el._id}
            >
              <div
                className="chat-search-results-el-img"
                style={{
                  backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${el.photo})`,
                }}
              ></div>
              <div className="chat-search-results-el-info">
                <div className="chat-search-results-el-name">{el.name}</div>
                <div className="chat-search-results-el-handle">
                  @{el.handle}
                </div>
              </div>
            </Link>
          ))}
        </>
      );
    }
    return null;
  };

  return (
    <div className="chat-search-container">
      <div className="chat-search-header">
        <div onClick={() => navigate(-1)} relative="path">
          <button>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </div>
        <input
          type="text"
          placeholder="Search"
          value={chatSearch}
          onChange={(e) => setChatSearch(e.target.value)}
        />
        <button
          className={chatSearch ? "active" : "inactive"}
          onClick={() => setChatSearch("")}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
      <div className="chat-search-results">
        {chatSearch.length === 0 ? (
          <p>Search somebody</p>
        ) : isLoading ? (
          <LoadingWave />
        ) : searchResults.length > 0 ? (
          <>
            {renderSearchResults(friends, "Friends")}
            {renderSearchResults(others, "Users")}
          </>
        ) : (
          <p>No results found. Please try again.</p>
        )}
      </div>
    </div>
  );
}
