import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";
import { createReport, deleteReport } from "../api/reportApis";

export const useReportsMutations = () => {
  const { showAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();

  const createReportMutation = useMutation({
    mutationFn: createReport,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      showAlert(data.message, data.status);
    },
  });

  const deleteReportMutation = useMutation({
    mutationFn: deleteReport,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries(["reports"]);
    },
  });

  return { createReportMutation, deleteReportMutation };
};
