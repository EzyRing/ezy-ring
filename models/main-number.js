const Joi = require("joi");
const mongoose = require("mongoose");

const mainNumberSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true,
  },
  areaCode: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  isTaken: {
    type: Boolean,
  },
  isLocal: {
    type: Boolean,
  },
});

const MainNumber = mongoose.model("main-number", mainNumberSchema);

function validateMainNumber(mainNumber) {
  const schema = {
    region: Joi.string().min(2).required(),
    areaCode: Joi.string().min(3).required(),
    number: Joi.string().min(7).required(),
    isTaken: Joi.boolean(),
    isLocal: Joi.boolean(),
  };

  return Joi.validate(mainNumber, schema);
}

exports.mainNumberSchema = mainNumberSchema;
exports.MainNumber = MainNumber;
exports.validate = validateMainNumber;
