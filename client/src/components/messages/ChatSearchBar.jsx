import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function ChatSearchBar() {
  const [chatSearch, setChatSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useContext(AuthContext);

  const clearSearch = () => {
    setChatSearch("");
  };

  useEffect(() => {
    if (chatSearch.length > 0) {
      const fetchSearchResults = async () => {
        setIsLoading(true);
        try {
          const res = await axios({
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/users/searchUsers?q=${chatSearch}`,
            withCredentials: true,
          });
          console.log(res);
          setSearchResults(res.data);
        } catch (error) {
          console.error("Error fetching search results", error);
        }
        setIsLoading(false);
      };
      fetchSearchResults();
    } else {
      setSearchResults([]);
    }
  }, [chatSearch]);

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
        <Link to=".." relative="path">
          <button>
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
        </Link>
        <input
          type="text"
          placeholder="Search"
          value={chatSearch}
          onChange={(e) => setChatSearch(e.target.value)}
        />
        <button
          className={chatSearch ? "active" : "inactive"}
          onClick={clearSearch}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
      <div className="chat-search-results">
        {chatSearch.length === 0 ? (
          <p>Search somebody</p>
        ) : isLoading ? (
          <p>Loading...</p>
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
