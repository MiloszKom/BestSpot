import { createContext, useState, useCallback } from "react";

export const AlertContext = createContext({
  alertData: {
    alertMsg: null,
    alertType: null,
  },
  showAlert: () => {},
  clearAlert: () => {},
});

export function AlertContextProvider({ children }) {
  const [alertData, setAlertData] = useState({
    alertMsg: null,
    alertType: null,
  });

  const showAlert = useCallback((msg, type) => {
    setAlertData({ alertMsg: msg, alertType: type });
  }, []);

  const clearAlert = useCallback(() => {
    setAlertData({ alertMsg: null, alertType: null });
  }, []);

  return (
    <AlertContext.Provider value={{ alertData, showAlert, clearAlert }}>
      {children}
    </AlertContext.Provider>
  );
}
