const express = require("express");

const app = express();

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.port || 8080;

const router = express.Router();


//app.use('/api', router);
app.listen(port);
console.log("Server started on port ") + port;

const mongoose = require("mongoose");
mongoose.connect("mongodb:35.229.111.221:2701//tenh_products");

// const Singer = require("./app/models/singer");
// const Song = require("./app/models/song");

// Start Routers
const songRouter = require("./app/controllers/songs");
const singerRouter = require("./app/controllers/singers");

router.use(function(req, res, next) {
  console.log("Something is happening.");
  next();
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with
app.use("/api/v1", singerRouter);
app.use("/api/v1/songs", songRouter);

// app.use("/api", router);

