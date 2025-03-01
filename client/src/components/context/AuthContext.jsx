import { createContext, useState, useEffect, useCallback } from "react";
import { checkCookies } from "../utils/helperFunctions";

export const AuthContext = createContext({
  isLoggedIn: false,
  userData: null,
  token: null,
  isDataFetched: false,
  login: () => {},
  logout: () => {},
});

export const AuthContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    const fetchCookies = async () => {
      const result = await checkCookies();
      if (result) {
        setIsLoggedIn(true);
        setUserData(result.user);
        localStorage.setItem("token", result.token);
      }
      setIsDataFetched(true);
    };

    fetchCookies();
  }, []);

  const login = useCallback((data) => {
    setIsLoggedIn(true);
    setUserData(data.data.user);
    setIsDataFetched(true);
    localStorage.setItem("token", data.token);
  }, []);

  const logout = useCallback(() => {
    setIsDataFetched(false);
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem("token");
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userData, isDataFetched, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
