import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const useProtectedAction = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const protectedAction = (action) => {
    if (!isLoggedIn) {
      navigate("/login");
      return false;
    }
    return action();
  };

  return protectedAction;
};
