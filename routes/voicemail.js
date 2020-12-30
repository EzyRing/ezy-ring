const { Voicemail, validate } = require("../models/voicemail");
const { PhoneNumber } = require("../models/phone-number");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const ObjectID = require("mongodb").ObjectID;

router.get("/testpost", async (req, res) => {
  console.log(req.query);
  req.query.from = "+" + req.query.from;
  req.query.number = "+" + req.query.number;

  const voicemailId = await PhoneNumber.findOne({
    number: req.query.number,
  }).select("_id");
  //console.log(numberId);
  //Date time
  let updateDate = new Date();
  updateDate = updateDate.toISOString();

  //console.log(updateDate);

  let voicemailblob = await Voicemail.findOne({ number: voicemailId });

  // console.log(messageblob);

  if (voicemailblob != null) {
    voicemailblob.updatedOn = updateDate;

    let voicemailObject = {
      from: req.query.from,
      voicelink:
        "http://199.244.88.78/voicemail/" + req.query.voicelink + ".wav",
      //voicelink: req.query.voicelink,
      timestamp: req.query.timestamp,
      _id: new ObjectID(),
    };
    // Message.update(
    //   { _id: numberId._id },
    //   { $push: { messages: messageObject } },
    //   { $set: { updatedOn: updateDate } }
    // );
    await voicemailblob.voicemails.push(voicemailObject);
    voicemailblob = await voicemailblob.save();
  } else {
    let voicemail = new Voicemail({
      number: voicemailId._id,
      updatedOn: updateDate,
      createdOn: updateDate,
    });

    let voicemailObject = {
      from: req.query.from,
      voicelink:
        "http://199.244.88.78/voicemail/" + req.query.voicelink + ".wav",
      timestamp: req.query.timestamp,
      _id: new ObjectID(),
    };

    await voicemail.voicemails.push(voicemailObject);
    voicemail = await voicemail.save();
  }

  const voicemail = await Voicemail.find().sort("updatedOn");
  res.send(voicemail);
});

router.get("/", auth, async (req, res) => {
  const voicemail = await Voicemail.find().sort("updatedOn");
  res.send(voicemail);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const voicemailId = await PhoneNumber.findOne({
    number: req.body.number,
  }).select("_id");
  //console.log(numberId);
  //Date time
  let updateDate = new Date();
  updateDate = updateDate.toISOString();

  //console.log(updateDate);

  let voicemailblob = await Voicemail.findOne({ number: voicemailId });

  // console.log(messageblob);

  if (voicemailblob != null) {
    voicemailblob.updatedOn = updateDate;

    let voicemailObject = {
      from: req.body.from,
      //voicelink: "http://199.244.88.78/voicemail/" + req.body.voicelink,
      voicelink: req.body.voicelink,
      timestamp: req.body.timestamp,
      _id: new ObjectID(),
    };
    // Message.update(
    //   { _id: numberId._id },
    //   { $push: { messages: messageObject } },
    //   { $set: { updatedOn: updateDate } }
    // );
    await voicemailblob.voicemails.push(voicemailObject);
    voicemailblob = await voicemailblob.save();
  } else {
    let voicemail = new Voicemail({
      number: voicemailId._id,
      updatedOn: updateDate,
      createdOn: updateDate,
    });

    let voicemailObject = {
      from: req.body.from,
      voicelink: req.body.voicelink,
      timestamp: req.body.timestamp,
      _id: new ObjectID(),
    };

    await voicemail.voicemails.push(voicemailObject);
    voicemail = await voicemail.save();
  }

  const voicemail = await Voicemail.find().sort("updatedOn");
  res.send(voicemail);
});

router.get("/:number", auth, async (req, res) => {
  const voicemailId = await PhoneNumber.findOne({
    number: req.params.number,
  }).select("_id");

  const voicemail = await Voicemail.findOne({ number: voicemailId._id });
  // console.log(message);
  //   console.log(
  //     message.messages.sort((a, b) => -a.timestamp.localeCompare(b.timestamp))
  //   );
  if (voicemail != null) {
    res.send(
      voicemail.voicemails.sort(
        (a, b) => -a.timestamp.localeCompare(b.timestamp)
      )
    );
  } else {
    res.send([]);
  }
});

module.exports = router;
