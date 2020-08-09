const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");
const { pricingPlanSchema } = require("./pricing-plan");
const { mainNumberSchema } = require("./main-number");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024,
  },
  isAdmin: {
    type: Boolean,
    default: true,
  },
  company: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  streetAddress: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  city: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  state: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  zipCode: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  cc_info: {
    cc_firstName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    cc_lastName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    cc_cardNumber: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    cc_cardExpiry: {
      type: String,
      required: true,
    },
    cc_cvv: {
      type: String,
      required: true,
    },
  },
  pricingPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "pricing-plan",
  },
  mainNumber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "main-number",
  },
  noOfUsers: {
    type: Number,
    required: true,
  },
  phoneNumber: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "phoneNumber",
    },
  ],
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    firstName: Joi.string().min(3).max(50).required(),
    lastName: Joi.string().min(3).max(255).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
    company: Joi.string().min(3).max(50).required(),
    streetAddress: Joi.string().min(5).max(255).required(),
    city: Joi.string().min(3).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    zipCode: Joi.number().required(),
    country: Joi.string().min(3).max(50).required(),
    cc_info: {
      cc_firstName: Joi.string().min(3).max(50).required(),
      cc_lastName: Joi.string().min(3).max(50).required(),
      cc_cardNumber: Joi.string().min(3).max(50).required(),
      cc_cardExpiry: Joi.string().required(),
      cc_cvv: Joi.string().max(4).required(),
    },
    pricingPlan: Joi.objectId().required(),
    mainNumber: Joi.objectId().required(),
    noOfUsers: Joi.number().max(100).required(),
  };

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
