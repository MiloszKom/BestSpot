import { AlertContext } from "../context/AlertContext";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import {
  deleteSpotlist,
  editSpotlist,
  removeSpotFromSpotlist,
  toggleLikeSpotlist,
} from "../api/spotlistsApis";

export const useSpotlistsMutations = () => {
  const navigate = useNavigate();
  const { showAlert } = useContext(AlertContext);
  const queryClient = useQueryClient();

  const deleteSpotlistMutation = useMutation({
    mutationFn: deleteSpotlist,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["userSpotlists"] });
      if (variables.shouldNavigate) {
        navigate("/spotlists");
      }
    },
  });

  const editSpotlistMutation = useMutation({
    mutationFn: editSpotlist,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.key] });
      showAlert(data.message, data.status);
    },
  });

  const deleteSpotFromSpotlistMutation = useMutation({
    mutationFn: removeSpotFromSpotlist,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries(["spotlistContent"]);
    },
  });

  const toggleSpotlistLikeMutation = useMutation({
    mutationFn: toggleLikeSpotlist,
    onMutate: async ({ spotlistId, isLiked }) => {
      const previousSpotlistData = queryClient.getQueryData([
        "spotlistContent",
        spotlistId,
      ]);

      await queryClient.cancelQueries(["spotlistContent", spotlistId]);

      queryClient.setQueryData(["spotlistContent", spotlistId], (oldData) => {
        if (!oldData) return oldData;
        const updatedData = {
          ...oldData.data,
          isSpotlistLiked: !isLiked,
          likeCount: oldData.data.likeCount + (isLiked ? -1 : 1),
        };

        return {
          ...oldData,
          data: updatedData,
        };
      });

      return { previousSpotlistData };
    },
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
  });

  return {
    deleteSpotlistMutation,
    deleteSpotFromSpotlistMutation,
    editSpotlistMutation,
    toggleSpotlistLikeMutation,
  };
};
