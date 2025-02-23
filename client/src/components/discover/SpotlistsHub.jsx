import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Spotlists } from "../spotlists/components/Spotlists";
import { getHubSpotlists } from "../api/spotlistsApis";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useInView } from "react-intersection-observer";
import useScrollPosition from "../hooks/useScrollPosition";
import LoadingWave from "../common/LoadingWave";

export default function SpotlistsHub() {
  const [order, setOrder] = useState(
    sessionStorage.getItem("spotlistHubOrder") === "popular"
      ? "popular"
      : "newest"
  );

  const navigate = useNavigate();

  const containerRef = useRef();
  useScrollPosition(containerRef, "scrolledHeightSpotlistHub");

  const { data, isLoading, isError, error, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["spotlistHub", order],
      queryFn: ({ pageParam = 1 }) =>
        getHubSpotlists({ pageParam, sortOption: order }),
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.data.length === 20) {
          return allPages.length + 1;
        }
        return undefined;
      },
    });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView) fetchNextPage();
  }, [fetchNextPage, inView]);

  const spotlists = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="spotlists-hub-container" ref={containerRef}>
      <div className="spotlists-hub-header">
        <div className="svg-wrapper">
          <FontAwesomeIcon icon={faArrowLeft} onClick={() => navigate(-1)} />
        </div>
        <span>Spotlists Hub</span>
      </div>
      <div className="spotlists-hub-sort-options">
        <button
          className={`sort-option ${order === "newest" ? "active" : ""}`}
          onClick={() => setOrder("newest")}
        >
          Newest
        </button>
        <button
          className={`sort-option ${order === "popular" ? "active" : ""}`}
          onClick={() => setOrder("popular")}
        >
          Popular
        </button>
      </div>
      <div className="spotlists-hub-body">
        {isLoading ? (
          <LoadingWave />
        ) : isError ? (
          <div className="general-error">
            {error.response?.data?.message || "An unexpected error occurred"}
          </div>
        ) : (
          <>
            <div className="spotlists-wrapper">
              <Spotlists spotlists={spotlists} disableOptions={true} />
            </div>
            <div className="post-fetch-info" ref={ref}>
              {hasNextPage ? (
                <LoadingWave />
              ) : (
                "Every spotlist has been displayed"
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
