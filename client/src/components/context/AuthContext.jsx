import { createContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  userData: null,
  login: () => {},
  logout: () => {},
});
