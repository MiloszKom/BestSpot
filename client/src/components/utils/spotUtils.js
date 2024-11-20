import axios from "axios";

export const fetchFromDatabase = async (
  id,
  setPlaceDetails,
  setIsFavourite,
  setPlaceNote,
  setJustFetched,
  setAlsoSavedBy,
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
      setIsFavourite(res.data.data.isFavourite);
      setJustFetched(false);
      setPlaceNote(res.data.data.userNote);
      setAlsoSavedBy(res.data.data.friendsWhoFavourited);
    } else {
      console.log("No data found in the database, proceeding with API fetch.");
      fetchFromApi(id, setPlaceDetails, setJustFetched);
    }
  } catch (err) {
    console.log("Error fetching from the database:", err);
    fetchFromApi(id, setPlaceDetails, setJustFetched);
  }
};

export const fetchFromApi = async (id, setPlaceDetails, setJustFetched) => {
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
    setJustFetched(true);

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

    setPlaceDetails((prev) => ({
      ...prev,
      photos: photoUrls.filter((url) => url !== null),
    }));
  } catch (err) {
    console.log("Error fetching place data or photos:", err);
  }
};

const blobToFile = (theBlob, fileName) => {
  theBlob.lastModifiedDate = new Date();
  theBlob.name = fileName;
  return theBlob;
};

const urlToBlob = async (imageUrl) => {
  console.log("Processed url :", imageUrl);
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image. Status: ${response.status}`);
    }
    const blob = await response.blob();
    console.log(`Blob created with type: ${blob.type}`);
    return blob;
  } catch (error) {
    console.error("Error converting image URL to Blob:", error);
    return null;
  }
};

export const saveSpotToDatabse = async (placeDetails, auth) => {
  console.log("Saving the spot to the database");
  try {
    const formData = new FormData();

    if (placeDetails.photos && placeDetails.photos.length > 0) {
      const photoPromises = placeDetails.photos.map(async (photoUrl, i) => {
        let blob;

        if (photoUrl.endsWith(".jpeg")) {
          blob = await urlToBlob(
            `http://${process.env.REACT_APP_SERVER}:5000/uploads/images/${placeDetails.photos[i]}`
          );
        } else {
          const response = await fetch(photoUrl);
          blob = await response.blob();
        }

        if (blob) {
          const file = blobToFile(blob, `image-${i + 1}.jpg`);
          formData.append("photo", file);
        } else {
          console.error(`Failed to create blob for photo: ${photoUrl}`);
        }
      });

      await Promise.all(photoPromises);
    }

    formData.append("_id", placeDetails._id);
    formData.append("name", placeDetails.name);
    formData.append("rating", placeDetails.rating);
    formData.append("user_ratings_total", placeDetails.user_ratings_total);
    formData.append("vicinity", placeDetails.vicinity);
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

    console.log("Success:", res.data);
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
