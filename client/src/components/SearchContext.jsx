import React, { createContext, useState } from "react";

// Create the context
export const SearchContext = createContext();

// Create the provider component
export const SearchProvider = ({ children }) => {
  const [selectedSubcategory, setSelectedSubcategory] = useState("Choose");
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [results, setResults] = useState([
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: { lat: 51.1010767, lng: 16.9485195 },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
      icon_background_color: "#FF9E67",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
      name: "Bar orientalny Sajgon",
      opening_hours: [Object],
      photos: [Array],
      place_id: "ChIJb_b_2F7BD0cRvN6UEET5qZc",
      plus_code: [Object],
      price_level: 1,
      rating: 4.8,
      reference: "ChIJb_b_2F7BD0cRvN6UEET5qZc",
      scope: "GOOGLE",
      types: [Array],
      user_ratings_total: 255,
      vicinity: "Marka Hłaski 25A, Wrocław",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: { lat: 51.0967482, lng: 16.9356036 },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
      icon_background_color: "#FF9E67",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
      name: "Oazja",
      opening_hours: [Object],
      photos: [Array],
      place_id: "ChIJD-5XDizBD0cRPe6b7rtecKE",
      plus_code: [Object],
      price_level: 2,
      rating: 4.7,
      reference: "ChIJD-5XDizBD0cRPe6b7rtecKE",
      scope: "GOOGLE",
      types: [Array],
      user_ratings_total: 554,
      vicinity: "Jurija Gagarina 5, Wrocław",
    },
    {
      business_status: "OPERATIONAL",
      geometry: {
        location: { lat: 51.1071934, lng: 16.9466579 },
      },
      icon: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/restaurant-71.png",
      icon_background_color: "#FF9E67",
      icon_mask_base_uri:
        "https://maps.gstatic.com/mapfiles/place_api/icons/v2/restaurant_pinlet",
      name: "Wasabi Sushi",
      opening_hours: [Object],
      photos: [Array],
      place_id: "ChIJfeTpF-7BD0cRGruIE0BXxXg",
      plus_code: [Object],
      rating: 4,
      reference: "ChIJfeTpF-7BD0cRGruIE0BXxXg",
      scope: "GOOGLE",
      types: [Array],
      user_ratings_total: 221,
      vicinity: "Graniczna 2, Wrocław",
    },
  ]);

  return (
    <SearchContext.Provider
      value={{
        selectedSubcategory,
        setSelectedSubcategory,
        userLat,
        setUserLat,
        userLng,
        setUserLng,
        results,
        setResults,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
