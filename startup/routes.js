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
const error = require("../middleware/error");
const cors = require("cors");

module.exports = function (app) {
  app.use(express.json());
  app.use(cors());
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
  app.use(error);
  // app.use((req, res, next) => {
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header("Access-Control-Allow-Headers", "*");

  //   if (req.method === "OPTIONS") {
  //     res.header(
  //       "Access-Control-Allow-Methods",
  //       "PUT, POST, PATCH, DELETE, GET, POST"
  //     );
  //     res.status(200).send("OK");
  //   }
  //   next();
  // });
};
