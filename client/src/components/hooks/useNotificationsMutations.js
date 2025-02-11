import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "../api/notificationsApis";
import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";

export const useNotificationsMutations = () => {
  const { showAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotification,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["notification"] });
    },
  });

  return { deleteNotificationMutation };
};
