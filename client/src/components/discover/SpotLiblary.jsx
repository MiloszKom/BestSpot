import React, { useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getSpotLiblary } from "../api/spotApis";
import { useInView } from "react-intersection-observer";
import LoadingWave from "../common/LoadingWave";
import Spot from "../spot/Spot";
import { useNavigate } from "react-router-dom";
import useScrollPosition from "../hooks/useScrollPosition";

export default function SpotLiblary() {
  const [order, setOrder] = useState(
    sessionStorage.getItem("spotLiblaryOrder") === "popular"
      ? "popular"
      : "newest"
  );
  const navigate = useNavigate();

  const containerRef = useRef();
  useScrollPosition(containerRef, "scrolledHeightSpotLiblary");

  const { data, isLoading, isError, error, hasNextPage, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["spotLiblary", order],
      queryFn: ({ pageParam = 1 }) =>
        getSpotLiblary({ pageParam, sortOption: order }),
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

  const spots = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="spotlists-hub-container" ref={containerRef}>
      <div className="spotlists-hub-header">
        <div className="svg-wrapper" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </div>
        <span>Spot Liblary</span>
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
            <div className="spot-liblary-spots">
              {spots.map((spot) => {
                return <Spot key={spot._id} spot={spot} />;
              })}
            </div>
            <div className="post-fetch-info" ref={ref}>
              {hasNextPage ? <LoadingWave /> : "Every spot has been displayed"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
