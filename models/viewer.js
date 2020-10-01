const Joi = require("joi");
const mongoose = require("mongoose");
const config = require("config");
const jwt = require("jsonwebtoken");

const viewerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  number: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "phoneNumber",
    },
  ],
});

viewerSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const Viewer = mongoose.model("viewer", viewerSchema, "viewer");

function validateViewer(viewer) {
  const schema = {
    name: Joi.string().min(3).max(50),
    password: Joi.string().min(3).max(16),
    number: Joi.string().min(3).max(16),
    subsidiary: Joi.objectId(),
  };

  return Joi.validate(viewer, schema);
}

//exports.mainNumberSchema = mainNumberSchema;
exports.Viewer = Viewer;
exports.validate = validateViewer;
