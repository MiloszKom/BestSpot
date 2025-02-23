import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const useProtectedAction = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const protectedAction = (
    action,
    message = "You need to be logged in to interact with content."
  ) => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: location, message } });
      return false;
    }
    return action();
  };

  return protectedAction;
};
