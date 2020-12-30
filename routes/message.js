const { Message, validate } = require("../models/message");
const { PhoneNumber } = require("../models/phone-number");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectID;

router.get("/", auth, async (req, res) => {
  const message = await Message.find().sort("updatedOn");
  res.send(message);
});

router.post("/", async (req, res) => {
  console.log(req.body);
  console.log(req.headers);
  const { error } = validate(req.body);
  if (error) {
    console.log(error);
    return res.status(400).send(error.details[0].message);
  }

  const numberId = await PhoneNumber.findOne({
    number: req.body.number,
  }).select("_id");
  console.log(numberId);
  //Date time
  let updateDate = new Date();
  updateDate = updateDate.toISOString();

  console.log(updateDate);

  let messageblob = await Message.findOne({ number: numberId });

  console.log(messageblob);

  if (messageblob != null) {
    messageblob.updatedOn = updateDate;

    let messageObject = {
      from: req.body.from,
      body: req.body.body,
      timestamp: req.body.timestamp,
      _id: new ObjectID(),
    };
    // Message.update(
    //   { _id: numberId._id },
    //   { $push: { messages: messageObject } },
    //   { $set: { updatedOn: updateDate } }
    // );
    await messageblob.messages.push(messageObject);
    messageblob = await messageblob.save();
  } else {
    let message = new Message({
      number: numberId._id,
      updatedOn: updateDate,
      createdOn: updateDate,
    });

    let messageObject = {
      from: req.body.from,
      body: req.body.body,
      timestamp: req.body.timestamp,
      _id: new ObjectID(),
    };

    await message.messages.push(messageObject);
    message = await message.save();
  }

  const message = await Message.find().sort("updatedOn");
  res.send(message);
});

router.get("/:number", auth, async (req, res) => {
  const numberId = await PhoneNumber.findOne({
    number: req.params.number,
  }).select("_id");

  const message = await Message.findOne({ number: numberId._id });
  // console.log(message);
  //   console.log(
  //     message.messages.sort((a, b) => -a.timestamp.localeCompare(b.timestamp))
  //   );
  if (message != null) {
    res.send(
      message.messages.sort((a, b) => -a.timestamp.localeCompare(b.timestamp))
    );
  } else {
    res.send([]);
  }
});

module.exports = router;
