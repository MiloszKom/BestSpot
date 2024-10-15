import { createContext } from "react";

export const ResultsContext = createContext({
  searchResults: null,
  getResults: () => {},
  deleteResults: () => {},
});
