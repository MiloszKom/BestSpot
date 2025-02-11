import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";
import { acceptRequest, deleteRequest } from "../api/friendsApis";

export const useFriendsMutations = () => {
  const { showAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();

  const acceptRequestMutation = useMutation({
    mutationFn: acceptRequest,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  const deleteRequestMutation = useMutation({
    mutationFn: deleteRequest,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
  });

  return { acceptRequestMutation, deleteRequestMutation };
};
