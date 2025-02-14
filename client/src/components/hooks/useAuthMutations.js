import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext";
import { login, signUp, updateInfo, updatePassword } from "../api/authApis";

export const useAuthMutations = () => {
  const auth = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  const handleError = (error) => {
    console.log(error);
    const message =
      error.response?.data?.message || "An unexpected error occurred";
    const status = error.response?.data?.status || "error";
    showAlert(message, status);
  };

  const handleSuccess = (data, navigateTo = "/") => {
    console.log(data);
    auth.login(data);
    showAlert(data.message, data.status);
    window.setTimeout(() => {
      navigate(navigateTo);
    }, 1500);
  };

  const loginMutation = useMutation({
    mutationFn: login,
    onError: handleError,
    onSuccess: (data) => handleSuccess(data),
  });

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onError: handleError,
    onSuccess: (data) => handleSuccess(data),
  });

  const updateInfoMutation = useMutation({
    mutationFn: updateInfo,
    onError: handleError,
    onSuccess: (data) => handleSuccess(data, `/${data.data.user.handle}`),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onError: handleError,
    onSuccess: (data) => handleSuccess(data, `/${data.data.user.handle}`),
  });

  return {
    loginMutation,
    signUpMutation,
    updatePasswordMutation,
    updateInfoMutation,
  };
};
