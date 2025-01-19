import React, { createContext, useState, useCallback } from "react";

export const ResultsContext = createContext({
  searchResults: null,
  getResults: () => {},
  deleteResults: () => {},
});

export const ResultsContextProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState(null);

  const getResults = useCallback((data) => {
    setSearchResults(data);
  }, []);

  const deleteResults = useCallback(() => {
    setSearchResults(null);
  }, []);

  return (
    <ResultsContext.Provider
      value={{ searchResults, getResults, deleteResults }}
    >
      {children}
    </ResultsContext.Provider>
  );
};
