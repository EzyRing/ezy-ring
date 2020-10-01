const Joi = require("joi");
const mongoose = require("mongoose");

const subsidiarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },

  viewer: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "viewer",
    },
  ],
});

const Subsidiary = mongoose.model("subsidiary", subsidiarySchema, "subsidiary");

function validateSubsidiary(subsidiary) {
  const schema = {
    name: Joi.string().min(3).max(50).required(),
  };

  return Joi.validate(subsidiary, schema);
}

//exports.mainNumberSchema = mainNumberSchema;
exports.Subsidiary = Subsidiary;
exports.validate = validateSubsidiary;
