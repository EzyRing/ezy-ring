const Joi = require("joi");
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  number: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "phone-number",
  },
  messages: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      from: {
        type: String,
        required: true,
      },
      body: {
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

const Message = mongoose.model("message", messageSchema);

function validateMessage(message) {
  const schema = {
    number: Joi.string().required(),
    from: Joi.string().required(),
    body: Joi.string().required(),
    timestamp: Joi.string().required(),
  };

  return Joi.validate(message, schema);
}

exports.messageSchema = messageSchema;
exports.Message = Message;
exports.validate = validateMessage;
