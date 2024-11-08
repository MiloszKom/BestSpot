import { createContext } from "react";

export const AlertContext = createContext({
  alertData: {
    alertMsg: null,
    alertType: null,
  },
  showAlert: () => {},
  clearAlert: () => {},
});

// import React, { createContext, useContext, useState } from "react";

// const AlertContext = createContext();

// export function AlertProvider({ children }) {
//   const [alert, setAlert] = useState({ type: "", msg: "", isVisible: false });

//   const showAlert = (type, msg) => {
//     setAlert({ type, msg, isVisible: true });
//     setTimeout(() => setAlert({ type: "", msg: "", isVisible: false }), 3000);
//   };

//   return (
//     <AlertContext.Provider value={{ alert, showAlert }}>
//       {children}
//     </AlertContext.Provider>
//   );
// }

// export function useAlert() {
//   return useContext(AlertContext);
// }
