import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";

import { AlertContext } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faEarthAmericas,
  faList,
  faLocationDot,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { faImage } from "@fortawesome/free-regular-svg-icons";
import PostTagging from "./components/PostTagging";

import PostImageCarousel from "./components/PostImageCarousel";
import PostAddSpots from "./components/PostAddSpots";
import PostSpots from "./components/PostSpots";
import PostSpotlists from "./components/PostSpotlists";
import PostAddSpotlists from "./components/PostAddSpotlists";

import ShowOptions from "../common/ShowOptions";
import { usePostsMutations } from "../hooks/usePostsMutations";
import Spinner from "../common/Spinner";

import * as nsfwjs from "nsfwjs";
import { useValidateUserContent } from "../hooks/useValidateUserContent";

export default function PostCreate() {
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

  const [options, setOptions] = useState(null);

  const [model, setModel] = useState(null);

  const { showAlert } = useContext(AlertContext);
  const { userData } = useContext(AuthContext);
  const { createPostMutation } = usePostsMutations();

  const { textValidator, imageValidator } = useValidateUserContent();

  useEffect(() => {
    nsfwjs.load().then((loadedModel) => {
      setModel(loadedModel);
    });
  }, []);

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

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const totalPhotos = selectedPhotos.length + files.length;

    if (totalPhotos > 5) {
      showAlert("You can upload up to only 5 images.", "error");
      return;
    }

    const safeFiles = [];

    for (const file of files) {
      const isSafe = await imageValidator(file, model);
      if (isSafe) {
        safeFiles.push(file);
      }
    }

    if (safeFiles.length < files.length) {
      showAlert(
        "Some images are inappropriate and cannot be uploaded.",
        "fail"
      );
    }

    setSelectedPhotos((prevSelectedPhotos) => [
      ...prevSelectedPhotos,
      ...safeFiles,
    ]);

    safeFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prevPreviews) => [...prevPreviews, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const createPost = async () => {
    const formData = new FormData();

    formData.append("visibility", postVisibility.toLowerCase());
    formData.append("content", postContent);

    if (!textValidator([postContent])) return;

    selectedPhotos.forEach((photo) => {
      formData.append("photos", photo);
    });

    selectedSpotlists.forEach((spotlist) => {
      formData.append("spotlists", spotlist._id);
    });

    selectedSpots.forEach((spot) => {
      formData.append("spots", spot._id);
    });

    createPostMutation.mutate(formData);
  };

  return (
    <div className="post-create">
      <div className="post-create-header">
        <Link to="/" className="svg-wrapper">
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>
        <span>Create a post</span>
      </div>
      <div className="post-create-body">
        <div
          className="profile-icon"
          style={{
            backgroundImage: `url(${userData.photo})`,
          }}
        ></div>
        <span>{userData.name}</span>
        <div className="post-privacy-control">
          <div
            className="post-create-privacy"
            onClick={() =>
              setOptions({
                aviableOptions: ["public", "friends"],
                entity: "postCreate",
              })
            }
          >
            <span>{postVisibility}</span>
            {postVisibility === "Public" ? (
              <FontAwesomeIcon icon={faEarthAmericas} />
            ) : (
              <FontAwesomeIcon icon={faUserGroup} />
            )}
          </div>

          {options && (
            <ShowOptions
              options={options}
              setOptions={setOptions}
              setData={setPostVisibility}
            />
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
          {selectedSpotlists.length > 0 && (
            <PostSpotlists
              selectedSpotlists={selectedSpotlists}
              setSelectedSpotlists={setSelectedSpotlists}
            />
          )}
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
          disabled={selectedSpotlists.length > 0 || selectedSpots.length > 0}
          multiple
        />
        <label
          className={`option ${
            selectedPhotos.length > 4 ||
            selectedSpotlists.length > 0 ||
            selectedSpots.length > 0
              ? "disabled"
              : ""
          }`}
          htmlFor="photos"
        >
          <FontAwesomeIcon icon={faImage} />
          <span htmlFor="photos">
            {selectedPhotos.length > 0 ? "Add More Images" : "Images"}
          </span>
        </label>
        <div
          className={`option ${
            selectedSpots.length > 0 || selectedPhotos.length > 0
              ? "disabled"
              : ""
          }`}
          onClick={() => setIsAddingSpotlists(true)}
        >
          <FontAwesomeIcon icon={faList} />
          <span>
            {selectedSpotlists.length > 0 ? "Add More Spotlists" : "Spotlists"}
          </span>
        </div>
        <div
          className={`option ${
            selectedSpotlists.length > 0 || selectedPhotos.length > 0
              ? "disabled"
              : ""
          }`}
          onClick={() => setIsAddingSpots(true)}
        >
          <FontAwesomeIcon icon={faLocationDot} />
          <span>{selectedSpots.length > 0 ? "Add More Spots" : "Spots"}</span>
        </div>
      </div>
      <button
        className={`post-create-btn ${
          !postContent || createPostMutation.isPending ? "disabled" : ""
        }`}
        onClick={createPost}
        disabled={!postContent || createPostMutation.isPending}
      >
        {createPostMutation.isPending ? <Spinner /> : "Create Post"}
      </button>

      {isAddingSpotlists &&
        selectedPhotos.length === 0 &&
        selectedSpots.length === 0 && (
          <PostAddSpotlists
            setIsAddingSpotlists={setIsAddingSpotlists}
            setSelectedSpotlists={setSelectedSpotlists}
            selectedSpotlists={selectedSpotlists}
          />
        )}

      {isAddingSpots &&
        selectedPhotos.length === 0 &&
        selectedSpotlists.length === 0 && (
          <PostAddSpots
            setIsAddingSpots={setIsAddingSpots}
            setSelectedSpots={setSelectedSpots}
            selectedSpots={selectedSpots}
          />
        )}

      {options && (
        <div className="options-overlay" onClick={() => setOptions(false)} />
      )}
    </div>
  );
}
