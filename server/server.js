const express = require("express");

// const fs = require("fs");
// const http = require("http");

const app = express();

app.get("/api", (req, res) => {
  res.json({ users: ["userOne", "userTwo", "userThree"] });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Listening to requests on port ${port}`);
});
