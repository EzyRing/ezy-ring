const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const { PricingPlan } = require("../models/pricing-plan");
const { MainNumber } = require("../models/main-number");
const { PhoneNumber } = require("../models/phone-number");
const express = require("express");
const router = express.Router();
const Fawn = require("fawn");
const Joi = require("joi");
const admin = require("../middleware/admin");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "-password -cc_info.cc_cvv"
  );
  await user.populate("pricingPlan").populate("mainNumber").execPopulate();
  //const user = await User.findById(req.user._id);
  // console.log(user._doc);
  res.send(user);
});

router.post("/", async (req, res) => {
  //console.log("Inroute");
  const { error } = validate(req.body);
  //console.log("Outroute");
  //console.log(error);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  //checkPackageId
  const pricingPlan = await PricingPlan.findById(req.body.pricingPlan);
  if (!pricingPlan) return res.status(400).send("Invalid pricingPlanId.");

  const mainNumber = await MainNumber.findById(req.body.mainNumber);
  if (!mainNumber) return res.status(400).send("Invalid mainNumber.");

  //console.log(pricingPlan);
  //console.log(mainNumber);

  user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    company: req.body.company,
    streetAddress: req.body.streetAddress,
    city: req.body.city,
    state: req.body.state,
    zipCode: req.body.zipCode,
    country: req.body.country,
    cc_info: {
      cc_firstName: req.body.cc_info.cc_firstName,
      cc_lastName: req.body.cc_info.cc_lastName,
      cc_cardNumber: req.body.cc_info.cc_cardNumber,
      cc_cardExpiry: req.body.cc_info.cc_cardExpiry,
      cc_cvv: req.body.cc_info.cc_cvv,
    },
    pricingPlan: {
      _id: pricingPlan._id,
    },
    mainNumber: {
      _id: mainNumber._id,
    },
    noOfUsers: req.body.noOfUsers,
    phoneNumber: [],
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user.cc_info.cc_cvv = await bcrypt.hash(user.cc_info.cc_cvv, salt);
  //await user.save();

  const token = user.generateAuthToken();

  // console.log(user._doc);
  //try {
  new Fawn.Task()
    .save("users", user)
    .update(
      "main-numbers",
      { _id: mainNumber._id },
      {
        isTaken: true,
      }
    )
    .run()
    .then(function () {
      // res.header("x-auth-token", token).send(
      //   //user
      //   _.pick(user, [
      //     "_id",
      //     "firstName",
      //     "lastName",
      //     "email",
      //     "password",
      //     "isAdmin",
      //     "company",
      //     "streetAddress",
      //     "city",
      //     "state",
      //     "zipCode",
      //     "country",
      //     "cc_info.cc_firstName",
      //     "cc_info.cc_lastName",
      //     "cc_info.cc_cardNumber",
      //     "cc_info.cc_cardExpiry",
      //     "cc_info.cc_cvv",
      //     "pricingPlan",
      //     "mainNumber",
      //     "noOfUsers",
      //     "phoneNumber",
      //   ])
      // );
      res.send({
        token: token,
      });
    })
    .catch(function (err) {
      // Everything has been rolled back.
      //log the error which caused the failure
      console.log(err);
      res.status(500).send(err);
    });
  // } catch (ex) {
  //   res.status(500).send("Try Catch Failed");
  // }
});

router.get("/phoneNumber", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("phoneNumber -_id");

  if (user) {
    await user.populate("phoneNumber").execPopulate();
    //console.log(user);
    return res.send(user);
  }
  res.status(404).send("No Number Found");
});

router.post("/phoneNumber", auth, async (req, res) => {
  const { error } = validatePhoneNumber(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id).select("phoneNumber");
  if (!user) return res.status(400).send("Invalid User.");

  let phonenumber = await PhoneNumber.find({
    _id: { $in: req.body.phoneNumber },
  });
  if (!phonenumber) return res.status(400).send("Phone Number doesnt exist");

  const found = await User.find({ phoneNumber: { $in: req.body.phoneNumber } });

  if (
    found &&
    typeof found != "undefined" &&
    found != null &&
    found.length != null &&
    found.length > 0
  ) {
    return res.status(400).send("Number Already Taken by the User.");
  }

  user.phoneNumber = user.phoneNumber || [];

  user.phoneNumber.push.apply(user.phoneNumber, req.body.phoneNumber);
  //user.phoneNumber.push(req.body.phoneNumber);

  try {
    phonenumber = await PhoneNumber.update(
      { _id: { $in: req.body.phoneNumber } },
      { $set: { isTaken: true } },
      { multi: true }
    );

    user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/phoneNumber", auth, admin, async (req, res) => {
  const { error } = validatePhoneNumber(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findById(req.user._id);
  if (!user) return res.status(400).send("Invalid User.");

  try {
    user = await User.update(
      { _id: req.user._id },
      { $pull: { phoneNumber: { $in: req.body.phoneNumber } } }
    );
    const phonenumber = await PhoneNumber.update(
      { _id: { $in: req.body.phoneNumber } },
      { $set: { isTaken: false } },
      { multi: true }
    );
    res.send(user);
  } catch (error) {
    res.status(501).send(error);
  }
});

function validatePhoneNumber(phoneNumbers) {
  const schema = {
    phoneNumber: Joi.array().items(Joi.objectId()),
  };
  return Joi.validate(phoneNumbers, schema);
}

module.exports = router;
