const express = require("express");
const genres = require("../routes/genres");
const customers = require("../routes/customers");
const movies = require("../routes/movies");
const rentals = require("../routes/rentals");
const users = require("../routes/users");
const auth = require("../routes/auth");
const pricing = require("../routes/pricing-plan");
const mainNumber = require("../routes/main-number");
const companyInfo = require("../routes/companyinfo");
const phoneNumber = require("../routes/phone-number");
const message = require("../routes/message");
const voicemail = require("../routes/voicemail");
const viewer = require("../routes/viewer");
const subsidiary = require("../routes/subsidiary");
const error = require("../middleware/error");
const cors = require("cors");
var bodyParser = require("body-parser");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, x-auth-token"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "PUT, POST, GET, DELETE, OPTIONS"
    );
    next();
  });
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  //app.use(cors());
  app.use("/api/genres", genres);
  app.use("/api/customers", customers);
  app.use("/api/movies", movies);
  app.use("/api/rentals", rentals);
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/pricing", pricing);
  app.use("/api/main-numbers", mainNumber);
  app.use("/api/companyinfo", companyInfo);
  app.use("/api/phonenumber", phoneNumber);
  app.use("/api/message", message);
  app.use("/api/voicemail", voicemail);
  app.use("/api/viewer", viewer);
  app.use("/api/subsidiary", subsidiary);
  app.use(error);
};
