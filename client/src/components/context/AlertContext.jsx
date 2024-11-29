import { createContext } from "react";

export const AlertContext = createContext({
  alertData: {
    alertMsg: null,
    alertType: null,
  },
  showAlert: () => {},
  clearAlert: () => {},
});
