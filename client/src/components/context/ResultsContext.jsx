import React, { createContext, useState, useCallback } from "react";

export const ResultsContext = createContext({
  searchResults: null,
  saveResults: () => {},
  deleteResults: () => {},
  location: null,
  saveLocation: () => {},
});

export const ResultsContextProvider = ({ children }) => {
  const [searchResults, setSearchResults] = useState(null);
  const [location, setLocation] = useState({
    lat: 51.0547188,
    lng: 16.8768283,
  });

  const saveResults = useCallback((data) => {
    setSearchResults(data);
  }, []);

  const saveLocation = useCallback((data) => {
    setLocation(data);
  });

  const deleteResults = useCallback(() => {
    setSearchResults(null);
    setLocation(null);
  }, []);

  return (
    <ResultsContext.Provider
      value={{
        searchResults,
        saveResults,
        deleteResults,
        location,
        saveLocation,
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
};
