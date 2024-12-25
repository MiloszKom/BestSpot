import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faAngleLeft,
  faAngleRight,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { faImage } from "@fortawesome/free-regular-svg-icons";

export default function PostImageCarousel({
  photoPreviews,
  setPhotoPreviews,
  setSelectedPhotos,
}) {
  const [imgOffset, setImgOffset] = useState(0);

  const swipeImg = (direction) => {
    setImgOffset((prevImgOffset) =>
      direction === "right" ? prevImgOffset + 100 : prevImgOffset - 100
    );
  };

  const deleteImage = () => {
    setPhotoPreviews((prevPreviews) => {
      const currentIndex = imgOffset / 100;

      const updatedPreviews = prevPreviews.filter(
        (_, index) => index !== currentIndex
      );

      setSelectedPhotos((prevSelected) =>
        prevSelected.filter((_, index) => index !== currentIndex)
      );

      if (prevPreviews.length > 1) {
        setImgOffset((prevImgOffset) =>
          currentIndex === prevPreviews.length - 1
            ? prevImgOffset - 100
            : prevImgOffset
        );
      }

      return updatedPreviews;
    });
  };

  return (
    <div className="preview-container">
      <div
        className="image-previews"
        style={{ transform: `translateX(-${imgOffset}%)` }}
      >
        {photoPreviews.map((preview, index) => {
          const photoUrl = setSelectedPhotos
            ? preview
            : `http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${preview}`;

          return (
            <div key={index} className="image-previews-el">
              <div
                className="image-preview-fade"
                style={{
                  backgroundImage: `url(${photoUrl})`,
                }}
              />
              <img src={photoUrl} alt={`preview-image-${index}`} />
            </div>
          );
        })}
      </div>
      <div className="image-preview-controls">
        {imgOffset !== 0 && (
          <div className="control-swipe left" onClick={() => swipeImg("left")}>
            <FontAwesomeIcon icon={faAngleLeft} />
          </div>
        )}
        {imgOffset / 100 !== photoPreviews.length - 1 && (
          <div
            className="control-swipe right"
            onClick={() => swipeImg("right")}
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </div>
        )}
        {photoPreviews.length > 1 && (
          <div className="current-image">
            {photoPreviews.map((_, index) => (
              <div
                key={index}
                className={`dot ${imgOffset / 100 === index ? "active" : ""}`}
              />
            ))}
          </div>
        )}
        {setSelectedPhotos && (
          <>
            <div className="control-swipe delete" onClick={deleteImage}>
              <FontAwesomeIcon icon={faTrashCan} />
            </div>
            <div className="image-counter">
              <span>{photoPreviews.length}/5</span>
              <FontAwesomeIcon icon={faImage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
