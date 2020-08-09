const winston = require("winston");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const config = require("config");

module.exports = function () {
  mongoose
    .connect(config.get("db"))
    .then(() => winston.info("Connected to MongoDB --> " + config.get("db")));

  Fawn.init(mongoose);
};
