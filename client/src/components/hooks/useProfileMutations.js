import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";
import { cancelInvite, sendInvite, unfriend } from "../api/profileApis";

export const useProfileMutations = () => {
  const { showAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();
  const lastViewedProfile = sessionStorage.getItem("lastViewedProfile") || null;

  const sendInviteMutation = useMutation({
    mutationFn: sendInvite,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["profile", lastViewedProfile]);
      showAlert(data.message, data.status);
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: cancelInvite,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["profile", lastViewedProfile]);
      showAlert(data.message, data.status);
    },
  });

  const unfriendMutation = useMutation({
    mutationFn: unfriend,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["profile", lastViewedProfile]);
      showAlert(data.message, data.status);
    },
  });

  return { sendInviteMutation, cancelInviteMutation, unfriendMutation };
};
