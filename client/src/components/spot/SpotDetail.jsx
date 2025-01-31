import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faGlobeEurope,
  faList,
  faLocationDot,
  faHeart as solidHeart,
  faBookmark as solidBookmark,
  faEllipsisVertical,
  faInfo,
} from "@fortawesome/free-solid-svg-icons";
import {
  faHeart as regularHeart,
  faBookmark as regularBookmark,
} from "@fortawesome/free-regular-svg-icons";

import {
  fetchFromDatabase,
  toggleSpotLike,
  toggleInsightLike,
} from "../utils/spotUtils";
import { convertToDisplayName, formatTimeAgo } from "../utils/helperFunctions";

import AddToSpotlist from "./components/AddToSpotlist";
import CreateNewSpotlist from "./components/CreateNewSpotlist";
import AddNote from "./components/AddNote";

import ShowOptions from "../common/ShowOptions";
import EditSpot from "./components/EditSpot";
import axios from "axios";

export default function SpotDetail() {
  const [placeDetails, setPlaceDetails] = useState(null);
  const [placeNote, setPlaceNote] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [spotlistId, setSpotlistId] = useState(null);

  const [addingNote, setAddingNote] = useState(false);
  const [addingToSpotlist, setAddingToSpotlist] = useState(false);
  const [creatingNewSpotlist, setCreatingNewSpotlist] = useState(false);

  const [options, setOptions] = useState(null);

  const [editingSpot, setEditingSpot] = useState(false);

  const [insight, setInsight] = useState("");

  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { userData } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);

  const highlightedInsightId = location.state?.highlightedInsightId;

  useEffect(() => {
    fetchFromDatabase(
      params.id,
      setPlaceDetails,
      setPlaceNote,
      setIsFavourite,
      setSpotlistId,
      highlightedInsightId
    );
  }, [params.id]);

  const createInsight = async () => {
    try {
      const res = await axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          content: insight,
        },
        url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${placeDetails._id}/insight`,
        withCredentials: true,
      });
      console.log(res);
      setPlaceDetails((prevDetails) => ({
        ...prevDetails,
        insights: [res.data.data, ...prevDetails.insights],
      }));
      showAlert(res.data.message, res.data.status);
      setInsight("");
    } catch (err) {
      console.log(err);
      showAlert(err.response.data.message, err.response.data.status);
    }
  };

  if (!placeDetails || !userData) return <div className="loader"></div>;

  const likeCount = placeDetails.likes.filter(
    (like) => like.isLikeActive === true
  ).length;

  const isSpotLiked = placeDetails.likes.some(
    (like) => like._id === userData._id && like.isLikeActive
  );

  const spotOptions =
    placeDetails.author._id === userData._id ? ["delete", "edit"] : ["report"];

  const isInsightCreated = placeDetails.insights.some(
    (insight) => insight.user._id === userData._id
  );

  return (
    <>
      <div className="spot-detail">
        <div className="spot-detail-content">
          <div
            className="spot-detail-photo"
            style={{
              backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${placeDetails.photo})`,
            }}
          >
            <button className="back-btn" onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div>
              <button
                className="options-btn"
                onClick={() =>
                  setOptions({
                    spotId: placeDetails._id,
                    aviableOptions: spotOptions,
                    entity: "spot",
                  })
                }
              >
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
              {options?.entity === "spot" && (
                <ShowOptions
                  options={options}
                  setOptions={setOptions}
                  setData={setPlaceDetails}
                  setEditingSpot={setEditingSpot}
                />
              )}
            </div>
          </div>
          <div className="spot-detail-header">
            <div className="name">{placeDetails.name}</div>
            <div className="engagement">{likeCount} likes</div>
            <Link to={`/${placeDetails.author.handle}`} className="author">
              <div
                className="image"
                style={{
                  backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${placeDetails.author.photo})`,
                }}
              />
              <span>{placeDetails.author.name}</span>
            </Link>
          </div>
          <div className="spot-detail-info">
            <div className="info-el">
              <FontAwesomeIcon icon={faLocationDot} />
              <span>{placeDetails.address}</span>
            </div>
            {placeDetails.overview && (
              <div className="info-el">
                <FontAwesomeIcon icon={faInfo} />
                <span>{placeDetails.overview}</span>
              </div>
            )}
            <div className="info-el">
              <FontAwesomeIcon icon={faList} />
              <span>{convertToDisplayName(placeDetails.category)}</span>
            </div>
            <div className="info-el">
              <FontAwesomeIcon icon={faGlobeEurope} />
              <span>{placeDetails.country}</span>
            </div>
            {isFavourite && (
              <div className="info-el">
                <FontAwesomeIcon icon={solidBookmark} />
                {placeNote ? (
                  <div className="note">
                    <div
                      className="note-edit"
                      onClick={() => setAddingNote(true)}
                    >
                      Edit Note
                    </div>
                    <div>Note my</div>
                  </div>
                ) : (
                  <div className="note">
                    <div
                      className="note-edit"
                      onClick={() => setAddingNote(true)}
                    >
                      Add Note
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="spot-detail-insights">
            <div className="insights-header">User insights (0)</div>
            {!isInsightCreated && placeDetails.author._id !== userData._id && (
              <div className="insight-add">
                <div
                  className="photo"
                  style={{
                    backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${userData.photo})`,
                  }}
                />
                <textarea
                  type="text"
                  value={insight}
                  onChange={(e) => setInsight(e.target.value)}
                  placeholder="Add your insight about the spot"
                />
                {insight && <button onClick={createInsight}>Post</button>}
              </div>
            )}
            <div className="spot-insights">
              {placeDetails.insights.map((insight) => {
                const insightOptions =
                  insight.user._id === userData._id
                    ? ["delete"]
                    : placeDetails.author._id === userData._id
                    ? ["delete", "report"]
                    : ["report"];

                const insightLikeCount = insight.likes.filter(
                  (like) => like.isLikeActive === true
                ).length;

                const isInsightLiked = insight.likes.some(
                  (like) => like._id === userData._id && like.isLikeActive
                );

                const isHiglighted = highlightedInsightId === insight._id;

                return (
                  <div
                    className={`post-detail-comment ${
                      isHiglighted ? "active" : ""
                    }`}
                    key={insight._id}
                  >
                    <Link
                      to={`/${insight.user.handle}`}
                      className="profile-icon"
                      style={{
                        backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${insight.user.photo})`,
                      }}
                    ></Link>
                    <div className="comment-header">
                      <Link
                        to={`/${insight.user.handle}`}
                        className="user-name"
                      >
                        {insight.user.name}
                      </Link>
                      <span className="user-handle">
                        @{insight.user.handle}
                      </span>
                      <span className="timestamp">
                        · {formatTimeAgo(insight.timestamp)}
                      </span>
                    </div>
                    <div className="post-options">
                      <button
                        className="options svg-wrapper"
                        onClick={() =>
                          setOptions({
                            spotId: placeDetails._id,
                            insightId: insight._id,
                            aviableOptions: insightOptions,
                            entity: "insight",
                          })
                        }
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>
                      {options?.insightId === insight._id && (
                        <ShowOptions
                          options={options}
                          setOptions={setOptions}
                          setData={setPlaceDetails}
                        />
                      )}
                    </div>
                    <div className="comment-content">{insight.content}</div>
                    <div className="comment-options">
                      <div
                        className="comment-option-like"
                        onClick={() =>
                          toggleInsightLike(
                            placeDetails._id,
                            insight._id,
                            isInsightLiked,
                            userData,
                            setPlaceDetails,
                            showAlert
                          )
                        }
                      >
                        {isInsightLiked ? (
                          <div className="svg-wrapper liked">
                            <FontAwesomeIcon icon={solidHeart} />
                          </div>
                        ) : (
                          <div className="svg-wrapper">
                            <FontAwesomeIcon icon={regularHeart} />
                          </div>
                        )}
                        <span>{insightLikeCount}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="spot-detail-options">
          <button
            className={`option-el ${isSpotLiked ? "active" : ""}`}
            onClick={() =>
              toggleSpotLike(
                placeDetails._id,
                isSpotLiked,
                userData,
                setPlaceDetails,
                showAlert
              )
            }
          >
            <FontAwesomeIcon icon={isSpotLiked ? solidHeart : regularHeart} />
            <span>Like</span>
          </button>
          <button
            className={`option-el ${isFavourite ? "active" : ""}`}
            onClick={() => setAddingToSpotlist(true)}
          >
            <FontAwesomeIcon
              icon={isFavourite ? solidBookmark : regularBookmark}
            />
            <span>{isFavourite ? "Manage spotlists" : "Save to spotlist"}</span>
          </button>
        </div>
        {options && (
          <div className="options-overlay" onClick={() => setOptions(false)} />
        )}
      </div>
      {addingNote && (
        <AddNote
          setAddingNote={setAddingNote}
          placeNote={placeNote}
          setPlaceNote={setPlaceNote}
          spotlistId={spotlistId}
          spotId={placeDetails._id}
        />
      )}
      {addingToSpotlist && (
        <AddToSpotlist
          setAddingToSpotlist={setAddingToSpotlist}
          setCreatingNewSpotlist={setCreatingNewSpotlist}
          spotId={placeDetails._id}
          setIsFavourite={setIsFavourite}
          setSpotlistId={setSpotlistId}
        />
      )}
      {creatingNewSpotlist && (
        <CreateNewSpotlist
          setCreatingNewSpotlist={setCreatingNewSpotlist}
          setIsFavourite={setIsFavourite}
          spotId={placeDetails._id}
          setSpotlistId={setSpotlistId}
        />
      )}
      {editingSpot && (
        <EditSpot
          placeDetails={placeDetails}
          setPlaceDetails={setPlaceDetails}
          setEditingSpot={setEditingSpot}
        />
      )}
      {addingToSpotlist && <div className="spotlist-shade" />}
      {creatingNewSpotlist && <div className="spotlist-shade" />}
      {addingNote && <div className="spotlist-shade" />}
      {editingSpot && <div className="spotlist-shade" />}
    </>
  );
}
