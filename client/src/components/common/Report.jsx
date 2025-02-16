import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useReportsMutations } from "../hooks/useReportsMutations";

export default function Report({ isReporting, setIsReporting }) {
  const [description, setDescription] = useState("");

  const { createReportMutation } = useReportsMutations();

  const sendReport = () => {
    const data = {
      reportedEntity: isReporting,
      description,
    };

    createReportMutation.mutate(data, {
      onSettled: () => {
        setIsReporting(false);
      },
    });
  };

  return (
    <div className="add-note-container">
      <div className="add-note-header">
        <span>Report</span>
        <div className="svg-wrapper" onClick={() => setIsReporting(false)}>
          <FontAwesomeIcon icon={faXmark} className="close-button" />
        </div>
      </div>
      <div className="add-note-input">
        <textarea
          className="add-note-textarea"
          placeholder="Provide additional details about the issue."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button className={`add-note-btn`} onClick={sendReport}>
        Confirm
      </button>
    </div>
  );
}
