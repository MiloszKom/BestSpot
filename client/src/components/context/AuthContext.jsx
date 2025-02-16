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
  const [token, setToken] = useState(null);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    const fetchCookies = async () => {
      const result = await checkCookies();
      if (result) {
        setIsLoggedIn(true);
        setUserData(result.user);
        setToken(result.token);
      }
      setIsDataFetched(true);
    };

    fetchCookies();
  }, []);

  const login = useCallback((data) => {
    console.log(data);
    setIsLoggedIn(true);
    setUserData(data.data.user);
    setToken(data.token);
    setIsDataFetched(true);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserData(null);
    setIsDataFetched(false);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, userData, token, isDataFetched, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
