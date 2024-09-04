import { useLoadScript } from "@react-google-maps/api";
import Map from "./map";

export default function LocationsMap() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.React_App_Api_Key,
    libraries: ["places"],
  });
  if (!isLoaded) return <div className="loader"></div>;
  return <Map />;
}
