const Joi = require("joi");
const mongoose = require("mongoose");

const companyinfoSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  companyAddress: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  callerIdName: {
    type: String,
    require: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const CompanyInfo = mongoose.model("companyinfo", companyinfoSchema);

function validateCompanyInfo(companyinfo) {
  const schema = {
    companyName: Joi.string().min(3).max(50).required(),
    city: Joi.string().min(3).max(50).required(),
    companyAddress: Joi.string().min(3).max(255).required(),
    state: Joi.string().min(2).max(50).required(),
    postalCode: Joi.string().min(3).max(50).required(),
    callerIdName: Joi.string().min(2).max(15).required(),
  };

  return Joi.validate(companyinfo, schema);
}

//exports.mainNumberSchema = mainNumberSchema;
exports.CompanyInfo = CompanyInfo;
exports.validate = validateCompanyInfo;
