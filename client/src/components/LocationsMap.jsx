import { useLoadScript } from "@react-google-maps/api";
import GoogleMap from "./map";

const libraries = ["places"];

export default function LocationsMap({ setShowNavbar }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_API_KEY,
    libraries,
  });

  if (!isLoaded) return <div className="loader"></div>;
  return <GoogleMap setShowNavbar={setShowNavbar} />;
}
