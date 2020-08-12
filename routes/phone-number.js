const { PhoneNumber, validate } = require("../models/phone-number");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const _ = require("lodash");

router.get("/", auth, async (req, res) => {
  let phoneNumbers;
  if (req.query.isTaken) {
    phoneNumbers = await PhoneNumber.find({ isTaken: req.query.isTaken });
  } else if (req.query.isTaken && req.query.by) {
    phoneNumbers = await PhoneNumber.find({ isTaken: req.query.isTaken })
      .sort("location")
      .select(req.query.by)
      .distinct("location");
    //numbers = await numbers;
  } else if (
    req.query.isTaken &&
    req.query.location &&
    !req.query.numberType &&
    !req.query.state
  ) {
    phoneNumbers = await PhoneNumber.find({
      isTaken: req.query.isTaken,
      location: req.query.location,
    })
      .sort("numberType")
      .select("numberType");
  } else if (
    req.query.isTaken &&
    req.query.region &&
    req.query.numberType &&
    !req.query.state
  ) {
    phoneNumbers = await PhoneNumber.find({
      isTaken: req.query.isTaken,
      location: req.query.location,
      numberType: req.query.numberType,
    })
      .sort("state")
      .select("state");
  } else if (
    req.query.isTaken &&
    req.query.region &&
    req.query.numberType &&
    req.query.state
  ) {
    numphoneNumbersbers = await PhoneNumber.find({
      isTaken: req.query.isTaken,
      location: req.query.location,
      numberType: req.query.numberType,
      state: req.query.state,
    })
      .sort("number")
      .select("number price");
  } else {
    phoneNumbers = await PhoneNumber.find().sort("state");
  }

  res.send(phoneNumbers);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).send("Invalid UserId.");

  let phoneNumber = await PhoneNumber.findOne({ number: req.body.number });
  if (phoneNumber)
    return res.status(400).send("phoneNumber already exist in the database");

  phoneNumber = new PhoneNumber({
    number: req.body.number,
    location: req.body.location,
    state: req.body.state,
    numberType: req.body.numberType,
    areaCode: req.body.areaCode,
    price: req.body.price,
  });
  phoneNumber = await phoneNumber.save();

  res.send(
    _.pick(phoneNumber, [
      "_id",
      "number",
      "location",
      "state",
      "numberType",
      "price",
      "price",
    ])
  );
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const phoneNumber = await PhoneNumber.findByIdAndUpdate(
    req.params.id,
    {
      number: req.body.number,
      location: req.body.location,
      numberType: req.body.numberType,
      state: req.body.state,
      areaCode: req.body.areaCode,
      price: req.body.price,
      isTaken: req.body.isTaken,
    },
    { new: true }
  );

  if (!phoneNumber)
    return res
      .status(404)
      .send("The phoneNumber with the given ID was not found.");

  res.send(phoneNumber);
});

router.delete("/:id", auth, async (req, res) => {
  const phoneNumber = await PhoneNumber.findByIdAndRemove(req.params, id);

  if (!phoneNumber)
    return res
      .status(404)
      .send("The compnayInfo with the given ID was not found.");

  res.send(compnayInfo);
});

router.get("/:id", auth, async (req, res) => {
  const phoneNumber = await PhoneNumber.findById(req.params.id);

  if (!phoneNumber)
    return res
      .status(404)
      .send("The phoneNumber with the given ID was not found.");

  res.send(phoneNumber);
});

module.exports = router;
