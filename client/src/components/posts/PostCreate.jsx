import React, { useState, useContext, useEffect } from "react";
import axios from "axios";

import { AlertContext } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEarthAmericas,
  faList,
  faLocationDot,
  faTrashCan,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import PostPrivacy from "./PostPrivacy";
import PostTagging from "./PostTagging";

import PostImageCarousel from "./components/PostImageCarousel";
import PostAddSpots from "./components/PostAddSpots";
import PostSpots from "./components/PostSpots";
import PostSpotlists from "./components/PostSpotlists";
import PostAddSpotlists from "./components/PostAddSpotlists";

export default function PostCreate({ setCreatingPost }) {
  const [settingPrivacy, setSettingPrivacy] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postVisibility, setPostVisibility] = useState("Public");
  const [isTagging, setIsTagging] = useState(false);
  const [taggedWord, setTaggedWord] = useState("");

  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);

  const [isAddingSpots, setIsAddingSpots] = useState(false);
  const [selectedSpots, setSelectedSpots] = useState([]);

  const [isAddingSpotlists, setIsAddingSpotlists] = useState(false);
  const [selectedSpotlists, setSelectedSpotlists] = useState([]);

  const { showAlert } = useContext(AlertContext);
  const { userData } = useContext(AuthContext);

  const handleInputChange = (e) => {
    const content = e.target.value;
    setPostContent(content);

    const cursorPosition = e.target.selectionStart;
    const textUpToCursor = content.slice(0, cursorPosition);

    const match = textUpToCursor.match(/(^|\s)@(\w*)$/);
    if (match) {
      setIsTagging(true);
      setTaggedWord(match[2]);
    } else {
      setIsTagging(false);
      setTaggedWord("");
    }
  };

  const handleTagCompletion = (handle) => {
    const content = postContent;
    const newContent = content.replace(/@(\w*)$/, `@${handle}`);

    setPostContent(newContent);
    setTaggedWord(handle);
    setIsTagging(false);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const totalPhotos = selectedPhotos.length + files.length;

    if (totalPhotos > 5) {
      showAlert("You can upload up to 5 images only.", "error");
      return;
    }

    setSelectedPhotos((prevSelectedPhotos) => [
      ...prevSelectedPhotos,
      ...files,
    ]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prevPreviews) => [...prevPreviews, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const createPost = async () => {
    try {
      const formData = new FormData();

      formData.append("visibility", postVisibility.toLowerCase());
      formData.append("content", postContent);

      selectedPhotos.forEach((photo) => {
        formData.append("photos", photo);
      });

      selectedSpotlists.forEach((spotlist) => {
        formData.append("spotlists", spotlist);
      });

      selectedSpots.forEach((spot) => {
        formData.append("spots", spot.id);
      });

      const res = await axios({
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data: formData,
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/posts`,
        withCredentials: true,
      });

      setCreatingPost(false);
      showAlert(res.data.message, res.data.status);
    } catch (err) {
      console.log(err);
      showAlert(err.response.data.message, err.response.data.status);
    }
  };

  return (
    <div className="post-create">
      <div className="post-create-header">
        <FontAwesomeIcon
          icon={faArrowLeft}
          onClick={() => setCreatingPost(false)}
        />
        <span>Create a post</span>
      </div>
      <div className="post-create-body">
        <div
          className="profile-icon"
          style={{
            backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${userData.photo})`,
          }}
        ></div>
        <span>{userData.name}</span>
        <div
          className="post-create-privacy"
          onClick={() => setSettingPrivacy(true)}
        >
          <span>{postVisibility}</span>
          {postVisibility === "Public" ? (
            <FontAwesomeIcon icon={faEarthAmericas} />
          ) : (
            <FontAwesomeIcon icon={faUserGroup} />
          )}
        </div>
        <div className="post-create-input-wrapper">
          {photoPreviews.length > 0 && (
            <PostImageCarousel
              photoPreviews={photoPreviews}
              setPhotoPreviews={setPhotoPreviews}
              setSelectedPhotos={setSelectedPhotos}
            />
          )}
          <textarea
            className="post-create-input"
            placeholder="Write here..."
            value={postContent}
            onChange={handleInputChange}
          ></textarea>
          {selectedSpots.length > 0 && (
            <PostSpots
              selectedSpots={selectedSpots}
              setSelectedSpots={setSelectedSpots}
            />
          )}
          <PostSpotlists
            selectedSpotlists={selectedSpotlists}
            setSelectedSpotlists={setSelectedSpotlists}
          />
          {isTagging && (
            <PostTagging
              taggedWord={taggedWord}
              setTaggedWord={setTaggedWord}
              setIsTagging={setIsTagging}
              handleTagCompletion={handleTagCompletion}
            />
          )}
        </div>
      </div>
      <div className="post-create-options">
        <input
          type="file"
          accept="image/*"
          id="photos"
          name="photos"
          onChange={handleFileChange}
          multiple
        />
        <label
          className={`option ${selectedPhotos.length > 4 ? "disabled" : ""}`}
          htmlFor="photos"
        >
          <FontAwesomeIcon icon={faImage} />
          <span htmlFor="photos">
            {selectedPhotos.length > 0 ? "Add More Images" : "Images"}
          </span>
        </label>
        <div
          className={`option ${selectedSpots.length > 0 ? "disabled" : ""}`}
          onClick={() => setIsAddingSpotlists(true)}
        >
          <FontAwesomeIcon icon={faList} />
          <span>Spotlists</span>
        </div>
        <div
          className={`option ${selectedSpotlists.length > 0 ? "disabled" : ""}`}
          onClick={() => setIsAddingSpots(true)}
        >
          <FontAwesomeIcon icon={faLocationDot} />
          <span>{selectedSpots.length > 0 ? "Add More Spots" : "Spots"}</span>
        </div>
      </div>
      <button
        className={`post-create-btn ${postContent ? "" : "disabled"}`}
        onClick={createPost}
      >
        Create Post
      </button>

      {settingPrivacy && (
        <div>
          <PostPrivacy
            setSettingPrivacy={setSettingPrivacy}
            setPostVisibility={setPostVisibility}
          />
          <div className="overlay"></div>
        </div>
      )}

      {isAddingSpots && (
        <PostAddSpots
          setIsAddingSpots={setIsAddingSpots}
          setSelectedSpots={setSelectedSpots}
          selectedSpots={selectedSpots}
        />
      )}

      {isAddingSpotlists && (
        <PostAddSpotlists
          setIsAddingSpotlists={setIsAddingSpotlists}
          setSelectedSpotlists={setSelectedSpotlists}
          selectedSpotlists={selectedSpotlists}
        />
      )}
    </div>
  );
}
