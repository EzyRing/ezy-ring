const Joi = require("joi");
const mongoose = require("mongoose");

const pricingPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  shortDiscription: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
  },
  details: {
    noOfUsers: { type: Number },
    assignUsers: Boolean,
    company: Boolean,
  },
});

const PricingPlan = mongoose.model("pricing-plan", pricingPlanSchema);

function validatePricingPlan(pricingPlan) {
  const schema = {
    name: Joi.string().min(3).required(),
    shortDiscription: Joi.string().min(3).required(),
    price: Joi.number().min(0).required(),
    currency: Joi.string(),
    details: Joi.object(),
  };

  return Joi.validate(pricingPlan, schema);
}

exports.pricingPlanSchema = pricingPlanSchema;
exports.PricingPlan = PricingPlan;
exports.validate = validatePricingPlan;
