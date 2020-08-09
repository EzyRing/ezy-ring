const winston = require("winston");
const mongoose = require("mongoose");
const Fawn = require("fawn");

module.exports = function () {
  mongoose
    .connect("mongodb://localhost/ezy-ring")
    .then(() => winston.info("Connected to MongoDB --> EZY-RING.DB"));

  Fawn.init(mongoose);
};
