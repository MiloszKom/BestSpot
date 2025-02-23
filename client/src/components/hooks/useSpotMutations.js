import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AlertContext } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext";
import {
  createInsight,
  createSpot,
  deleteInsight,
  deleteSpot,
  editNote,
  editSpot,
  toggleInsightLike,
  toggleSpotLike,
} from "../api/spotApis";
import { createSpotlist, manageSpotlists } from "../api/spotlistsApis";

export const useSpotMutations = () => {
  const queryClient = useQueryClient();

  const { showAlert } = useContext(AlertContext);
  const { userData } = useContext(AuthContext);
  const navigate = useNavigate();

  const createSpotMutation = useMutation({
    mutationFn: createSpot,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data) => {
      showAlert(data.message, data.status);
      navigate("/");
    },
  });

  const editSpotMutation = useMutation({
    mutationFn: editSpot,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["spot", variables.spotId] });
    },
  });

  const deleteSpotMutation = useMutation({
    mutationFn: deleteSpot,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["spot", variables.spotId] });
      navigate(-1);
    },
  });

  const editNoteMutation = useMutation({
    mutationFn: editNote,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["spot", variables.spotId] });
    },
  });

  const toggleSpotLikeMutation = useMutation({
    mutationFn: toggleSpotLike,
    onMutate: async ({ isLiked, spotId }) => {
      const previousSpotData = queryClient.getQueryData(["spot", spotId]);
      await queryClient.cancelQueries(["spot", spotId]);

      queryClient.setQueryData(["spot", spotId], (oldData) => {
        if (!oldData) return oldData;
        const updatedData = {
          ...oldData.data,
          isLiked: !isLiked,
          likeCount: oldData.data.likeCount + (isLiked ? -1 : 1),
        };

        return {
          ...oldData,
          data: updatedData,
        };
      });

      return { previousSpotData };
    },
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
  });

  const manageSpotlistsMutation = useMutation({
    mutationFn: manageSpotlists,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({
        queryKey: ["spot", variables.spotId],
      });
    },
  });

  const createSpotlistMutation = useMutation({
    mutationFn: createSpotlist,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["spot", variables.spotId] });
    },
  });

  const createInsightMutation = useMutation({
    mutationFn: createInsight,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["spot", variables.spotId] });
    },
  });

  const deleteInsightMutation = useMutation({
    mutationFn: deleteInsight,
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
    onSuccess: (data, variables) => {
      showAlert(data.message, data.status);
      queryClient.invalidateQueries({ queryKey: ["spot", variables.spotId] });
    },
  });

  const toggleInsightLikeMutation = useMutation({
    mutationFn: toggleInsightLike,
    onMutate: async ({ isLiked, spotId, insightId }) => {
      const previousSpotData = queryClient.getQueryData(["spot", spotId]);
      await queryClient.cancelQueries(["spot", spotId]);

      queryClient.setQueryData(["spot", spotId], (oldData) => {
        if (!oldData) return oldData;
        const updatedData = {
          ...oldData.data,
          insights: oldData.data.insights.map((insight) =>
            insight._id === insightId
              ? {
                  ...insight,
                  likes: isLiked
                    ? insight.likes.filter((like) => like._id !== userData._id)
                    : [
                        ...insight.likes,
                        { _id: userData._id, isLikeActive: true },
                      ],
                }
              : insight
          ),
        };

        return {
          ...oldData,
          data: updatedData,
        };
      });

      return { previousSpotData };
    },
    onError: (error) => {
      showAlert(error.response.data.message, error.response.data.status);
    },
  });

  return {
    createSpotMutation,
    editSpotMutation,
    deleteSpotMutation,
    editNoteMutation,
    toggleSpotLikeMutation,
    manageSpotlistsMutation,
    createSpotlistMutation,
    createInsightMutation,
    deleteInsightMutation,
    toggleInsightLikeMutation,
  };
};
