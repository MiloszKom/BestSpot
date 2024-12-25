import axios from "axios";

export const fetchFromDatabase = async (
  id,
  setPlaceDetails,
  setPlaceNote,
  setIsFavourite,
  setAlsoSavedBy,
  setSpotlistId,
  fetchFromApi
) => {
  try {
    const res = await axios({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      url: `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots/${id}`,
      withCredentials: true,
    });

    console.log(res);

    if (res.data.data.spot) {
      setPlaceDetails(res.data.data.spot);
      setPlaceNote(res.data.data.userNote);
      setIsFavourite(res.data.data.isFavourite);
      setSpotlistId(res.data.data.spotlistId);
      setAlsoSavedBy(res.data.data.friendsWhoFavourited);
    } else {
      console.log("No data found in the database, proceeding with API fetch.");
      // fetchFromApi(id, setPlaceDetails);
    }
  } catch (err) {
    console.log("Error fetching from the database:", err);
    // fetchFromApi(id, setPlaceDetails);
  }
};

export const fetchFromApi = async (id, setPlaceDetails) => {
  try {
    const res = await axios({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      url: "/api/v1/maps/getPlaceDetails",
      data: { id },
      withCredentials: true,
    });

    const placeData = res.data.googleData.result;
    placeData.geometry = placeData.geometry.location;
    placeData._id = placeData.place_id;
    console.log("Place Data:", placeData);
    setPlaceDetails(placeData);

    const photos = placeData.photos || [];
    if (photos.length === 0) {
      return;
    }

    const fetchPhotoPromises = photos.slice(0, 3).map((photo) => {
      const photoData = {
        maxwidth: photo.width,
        photo_reference: photo.photo_reference,
      };

      return axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        url: "/api/v1/maps/getPlacePhotos",
        data: photoData,
        responseType: "blob",
      })
        .then((response) => {
          const imageUrl = URL.createObjectURL(response.data);
          return imageUrl;
        })
        .catch((err) => {
          console.log("Error fetching photo:", err);
          return null;
        });
    });

    const photoUrls = await Promise.all(fetchPhotoPromises);

    setPlaceDetails((currentPlaceDetails) => {
      const updatedDetails = {
        ...currentPlaceDetails,
        photos: photoUrls.filter((url) => url !== null),
      };

      saveSpotToDatabse(updatedDetails, setPlaceDetails);

      return updatedDetails;
    });
  } catch (err) {
    console.log("Error fetching place data or photos:", err);
  }
};

const blobToFile = (theBlob, fileName) => {
  theBlob.lastModifiedDate = new Date();
  theBlob.name = fileName;
  return theBlob;
};

export const saveSpotToDatabse = async (placeDetails, setPlaceDetails) => {
  try {
    const formData = new FormData();

    if (placeDetails.photos && placeDetails.photos.length > 0) {
      const photoUrl = placeDetails.photos[0]; // Get the first photo

      try {
        const response = await fetch(photoUrl);
        const blob = await response.blob();

        if (blob) {
          const file = blobToFile(blob, "image-1.jpg");
          formData.append("photo", file);
        } else {
          console.error(`Failed to create blob for photo: ${photoUrl}`);
        }
      } catch (error) {
        console.error(`Error fetching photo: ${photoUrl}`, error);
      }
    }

    let city = null;
    let country = null;

    placeDetails.address_components.forEach((component) => {
      if (component.types.includes("locality")) {
        city = component.long_name;
      }
      if (component.types.includes("country")) {
        country = component.long_name;
      }
    });

    formData.append("google_id", placeDetails._id);
    formData.append("name", placeDetails.name);
    formData.append("rating", placeDetails.rating);
    formData.append("user_ratings_total", placeDetails.user_ratings_total);
    formData.append("vicinity", placeDetails.vicinity);
    formData.append("city", city);
    formData.append("country", country);
    formData.append(
      "current_opening_hours",
      JSON.stringify(placeDetails.current_opening_hours)
    );
    if (placeDetails.website) formData.append("website", placeDetails.website);
    if (placeDetails.international_phone_number)
      formData.append(
        "international_phone_number",
        placeDetails.international_phone_number
      );
    formData.append("reviews", JSON.stringify(placeDetails.reviews));
    formData.append("url", placeDetails.url);
    formData.append("geometry", JSON.stringify(placeDetails.geometry));

    const res = await axios.post(
      `http://${process.env.REACT_APP_SERVER}:5000/api/v1/spots`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    console.log("Success:", res.data.data.fav);
    setPlaceDetails(res.data.data.fav);
  } catch (err) {
    console.error(
      "Error adding to favourites:",
      err.response ? err.response.data : err.message
    );
  }
};

const formatSpotTime = (time) => {
  const hours = time.slice(0, 2);
  const minutes = time.slice(2);
  return `${hours}:${minutes}`;
};

export const getNearestTime = (placeDetails) => {
  let periods = placeDetails.current_opening_hours.periods;
  if (!periods) return;

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 100 + now.getMinutes();

  if (!periods[currentDay]) {
    const currentOpeningHours =
      placeDetails?.current_opening_hours?.weekday_text;

    if (currentOpeningHours && currentOpeningHours[currentDay - 1]) {
      const openingHoursText =
        currentOpeningHours[currentDay - 1].split(": ")[1];

      if (openingHoursText === "Open 24 hours") {
        return <span className="map-result-open">Open 24 hours</span>;
      }
    }

    return (
      <>
        <span className="map-result-closed">Closed </span>
        <span>&middot; Not Operating Today</span>
      </>
    );
  }

  const todayHours = periods[currentDay];

  if (currentTime < todayHours.open.time) {
    return (
      <>
        <span className="map-result-closed">Closed</span>
        &nbsp;·&nbsp;Opens {formatSpotTime(todayHours.open.time)}
      </>
    );
  } else if (currentTime < todayHours.close.time) {
    return (
      <>
        <span className="map-result-open">Open</span>
        &nbsp;·&nbsp;Closes {formatSpotTime(todayHours.close.time)}
      </>
    );
  } else {
    return <span className="map-result-closed">Closed</span>;
  }
};
