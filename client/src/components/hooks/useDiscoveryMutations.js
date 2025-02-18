// import { useMutation, useQueryClient } from "@tanstack/react-query";

// import { useContext } from "react";
// import { AlertContext } from "../context/AlertContext";
// import { getLocation } from "../api/discoveryApis";

// export const useDiscoveryMutations = () => {
//   const { showAlert } = useContext(AlertContext);
//   const queryClient = useQueryClient();

//   const getLocationMutation = useMutation({
//     mutationFn: getLocation,
//     onError: (error) => {
//       showAlert(error.response.data.message, error.response.data.status);
//     },
//     onSettled: () => {

//     }

//   });

//   return { deleteNotificationMutation };
// };
