import React, { useState, useContext } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
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

import { convertToDisplayName, formatTimeAgo } from "../utils/helperFunctions";

import AddToSpotlist from "./components/AddToSpotlist";
import CreateNewSpotlist from "./components/CreateNewSpotlist";
import AddNote from "./components/AddNote";

import ShowOptions from "../common/ShowOptions";
import EditSpot from "./components/EditSpot";
import { useQuery } from "@tanstack/react-query";
import { getSpot } from "../api/spotApis";
import { useSpotMutations } from "../hooks/useSpotMutations";

export default function SpotDetail() {
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

  const highlightedInsightId = location.state?.highlightedInsightId;

  const { data, isLoading } = useQuery({
    queryKey: ["spot", params.id],
    queryFn: () => getSpot(params.id),
  });

  const spot = data?.data;

  const {
    deleteSpotMutation,
    toggleSpotLikeMutation,
    createInsightMutation,
    deleteInsightMutation,
    toggleInsightLikeMutation,
  } = useSpotMutations();

  if (isLoading || !userData) return <div className="loader" />;

  const spotOptions =
    spot.author._id === userData._id ? ["delete", "edit"] : ["report"];

  const isInsightCreated = spot.insights.some(
    (insight) => insight.user._id === userData._id
  );

  return (
    <>
      <div className="spot-detail">
        <div className="spot-detail-content">
          <div
            className="spot-detail-photo"
            style={{
              backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.photo})`,
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
                    spotId: spot._id,
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
                  setEditingSpot={setEditingSpot}
                  deleteSpot={() => deleteSpotMutation.mutate(spot._id)}
                />
              )}
            </div>
          </div>
          <div className="spot-detail-header">
            <div className="name">{spot.name}</div>
            <div className="engagement">{spot.likeCount} likes</div>
            <Link to={`/${spot.author.handle}`} className="author">
              <div
                className="image"
                style={{
                  backgroundImage: `url(http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${spot.author.photo})`,
                }}
              />
              <span>{spot.author.name}</span>
            </Link>
          </div>
          <div className="spot-detail-info">
            <div className="info-el">
              <FontAwesomeIcon icon={faLocationDot} />
              <span>{spot.address}</span>
            </div>
            {spot.overview && (
              <div className="info-el">
                <FontAwesomeIcon icon={faInfo} />
                <span>{spot.overview}</span>
              </div>
            )}
            <div className="info-el">
              <FontAwesomeIcon icon={faList} />
              <span>{convertToDisplayName(spot.category)}</span>
            </div>
            <div className="info-el">
              <FontAwesomeIcon icon={faGlobeEurope} />
              <span>{spot.country}</span>
            </div>
            {spot.isSaved && (
              <div className="info-el">
                <FontAwesomeIcon icon={solidBookmark} />
                {spot.spotNote ? (
                  <div className="note">
                    <div
                      className="note-edit"
                      onClick={() => setAddingNote(true)}
                    >
                      Edit Note
                    </div>
                    <div>{spot.spotNote}</div>
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
            {!isInsightCreated && spot.author._id !== userData._id && (
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
                {insight && (
                  <button
                    onClick={() =>
                      createInsightMutation.mutate({
                        comment: insight,
                        spotId: spot._id,
                      })
                    }
                  >
                    Post
                  </button>
                )}
              </div>
            )}
            <div className="spot-insights">
              {spot.insights.map((insight) => {
                const insightOptions =
                  insight.user._id === userData._id
                    ? ["delete"]
                    : spot.author._id === userData._id
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
                            spotId: spot._id,
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
                          deleteInsight={() =>
                            deleteInsightMutation.mutate({
                              spotId: spot._id,
                              insightId: options.insightId,
                            })
                          }
                        />
                      )}
                    </div>
                    <div className="comment-content">{insight.content}</div>
                    <div className="comment-options">
                      <div
                        className="comment-option-like"
                        onClick={() =>
                          toggleInsightLikeMutation.mutate({
                            isLiked: isInsightLiked,
                            spotId: spot._id,
                            insightId: insight._id,
                          })
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
            className={`option-el ${spot.isLiked ? "active" : ""}`}
            onClick={() =>
              toggleSpotLikeMutation.mutate({
                isLiked: spot.isLiked,
                spotId: spot._id,
              })
            }
          >
            <FontAwesomeIcon icon={spot.isLiked ? solidHeart : regularHeart} />
            <span>Like</span>
          </button>
          <button
            className={`option-el ${spot.isSaved ? "active" : ""}`}
            onClick={() => setAddingToSpotlist(true)}
          >
            <FontAwesomeIcon
              icon={spot.isSaved ? solidBookmark : regularBookmark}
            />
            <span>
              {spot.isSaved ? "Manage spotlists" : "Save to spotlist"}
            </span>
          </button>
        </div>
        {options && (
          <div className="options-overlay" onClick={() => setOptions(false)} />
        )}
      </div>
      {addingNote && (
        <AddNote
          setAddingNote={setAddingNote}
          spotNote={spot.spotNote}
          spotId={spot._id}
        />
      )}
      {addingToSpotlist && (
        <AddToSpotlist
          setAddingToSpotlist={setAddingToSpotlist}
          setCreatingNewSpotlist={setCreatingNewSpotlist}
          spotId={spot._id}
        />
      )}
      {creatingNewSpotlist && (
        <CreateNewSpotlist
          setCreatingNewSpotlist={setCreatingNewSpotlist}
          spotId={spot._id}
        />
      )}
      {editingSpot && <EditSpot spot={spot} setEditingSpot={setEditingSpot} />}
      {addingToSpotlist && <div className="spotlist-shade" />}
      {creatingNewSpotlist && <div className="spotlist-shade" />}
      {addingNote && <div className="spotlist-shade" />}
      {editingSpot && <div className="spotlist-shade" />}
    </>
  );
}
