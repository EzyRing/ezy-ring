const Joi = require("joi");
const mongoose = require("mongoose");

const phoneNumberSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  numberType: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  areaCode: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isTaken: {
    type: Boolean,
    default: false,
  },
  viewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "viewer",
    default: null,
  },
});

const PhoneNumber = mongoose.model("phoneNumber", phoneNumberSchema);

function phoneNumberInfo(phoneNumber) {
  const schema = {
    number: Joi.string().min(3).max(50).required(),
    location: Joi.string().min(3).max(50).required(),
    numberType: Joi.string().min(3).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    areaCode: Joi.string().min(3).max(50).required(),
    price: Joi.number().required(),
  };

  return Joi.validate(phoneNumber, schema);
}

exports.PhoneNumber = PhoneNumber;
exports.validate = phoneNumberInfo;
