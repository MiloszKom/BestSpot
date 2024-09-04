import React, { createContext, useState } from "react";

// Create the context
export const SearchContext = createContext();

// Create the provider component
export const SearchProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  return (
    <SearchContext.Provider value={{ location, setLocation }}>
      {children}
    </SearchContext.Provider>
  );
};
