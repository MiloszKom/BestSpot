import { useLoadScript } from "@react-google-maps/api";
import GoogleMap from "./map";

const libraries = ["places"];

export default function LocationsMap() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.React_App_Api_Key,
    libraries,
  });

  if (!isLoaded) return <div className="loader"></div>;
  return <GoogleMap />;
}
