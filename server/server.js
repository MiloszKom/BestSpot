const express = require("express");
const axios = require("axios");

const app = express();

const port = 5000;

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});

// const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
// const params = {
//   keyword: "restaurant",
//   location: "51.0443583,16.8675189",
//   radius: 3000,
//   type: "restaurant",
//   key: "AIzaSyBLzOyErw_GGeOYghEGKdDdV8Wyfx7kTpw",
// };

// app.get("/api/v1/places", (req, res) => {
//   axios
//     .get(url, { params })
//     .then((response) => {
//       res.json(response.data);
//     })
//     .catch((error) => {
//       console.error("Error fetching data:", error);
//     });
// });
