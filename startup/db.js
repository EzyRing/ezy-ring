const winston = require("winston");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const config = require("config");

module.exports = function () {
  const db = config.get("db");
  mongoose
    .connect(db, {
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => winston.info(`Connected to ${db}...`));

  Fawn.init(mongoose);
};
