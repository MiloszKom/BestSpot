import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getReports } from "../api/reportApis";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import LoadingWave from "../common/LoadingWave";

import { useReportsMutations } from "../hooks/useReportsMutations";

export default function Reports() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: getReports,
  });

  const reports = data?.data;

  const { deleteReportMutation } = useReportsMutations();

  const getEntityType = (reportedEntity) => {
    if (reportedEntity.replyId) {
      return "reply";
    } else if (reportedEntity.commentId) {
      return "comment";
    } else if (reportedEntity.postId) {
      return "post";
    } else if (reportedEntity.insightId) {
      return "insight";
    } else if (reportedEntity.spotId) {
      return "spot";
    } else {
      return "unknown";
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-body">
        <div className="reports-header">
          <div className="reports-label">User</div>
          <div className="reports-label">Entity</div>
          <div className="reports-label">Description</div>
          <div className="reports-label">X</div>
        </div>
        {isLoading ? (
          <LoadingWave />
        ) : reports?.length > 0 ? (
          reports.map((report) => {
            const { reporter, description, reportedEntity } = report;
            const entityType = getEntityType(reportedEntity);
            const linkUrl = ["post", "comment", "reply"].includes(entityType)
              ? `/${reporter.handle}/${reportedEntity.postId}`
              : `/spot/${reportedEntity.spotId}`;

            return (
              <div className="report-el">
                <Link to={`/${reporter.handle}`} className="reports-label">
                  {reporter.name}
                </Link>
                <div className="reports-label">{entityType}</div>
                <Link
                  to={linkUrl}
                  state={{
                    highlightedCommentId: reportedEntity.commentId,
                    highlightedReplyId: reportedEntity.replyId,
                    highlightedInsightId: reportedEntity.insightId,
                  }}
                  className="reports-label"
                >
                  {description}
                </Link>
                <div
                  className="reports-label delete"
                  onClick={() => deleteReportMutation.mutate(report._id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="reports-empty">No reports aviable</div>
        )}
      </div>
    </div>
  );
}
