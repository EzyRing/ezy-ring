const Joi = require("joi");
const mongoose = require("mongoose");

const voicemailSchema = new mongoose.Schema({
  number: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "phone-number",
  },
  voicemails: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      from: {
        type: String,
        required: true,
      },
      voicelink: {
        type: String,
        required: true,
      },
      timestamp: {
        type: String,
        required: true,
      },
    },
  ],
  createdOn: String,
  updatedOn: String,
});

const Voicemail = mongoose.model("voicemail", voicemailSchema);

function validateVoicemail(voicemail) {
  const schema = {
    number: Joi.string().required(),
    from: Joi.string().required(),
    voicelink: Joi.string().required(),
    timestamp: Joi.string().required(),
  };

  return Joi.validate(voicemail, schema);
}

exports.voicemailSchema = voicemailSchema;
exports.Voicemail = Voicemail;
exports.validate = validateVoicemail;
