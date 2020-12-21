const { CompanyInfo, validate } = require("../models/companyinfo");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const _ = require("lodash");

router.get("/", auth, async (req, res) => {
  // let info = await CompanyInfo.findOne({ user: req.user._id }).populate({
  //   path: "subsidiary",
  //   model: "subsidiary",
  // });
  let info = await CompanyInfo.findOne({ user: req.user._id });
  res.send(info);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).send("Invalid UserId.");

  let companyInfo = await CompanyInfo.findOne({ user: req.user._id });
  if (companyInfo)
    return res.status(400).send("Company already exist for this user.");

  companyInfo = new CompanyInfo({
    companyName: req.body.companyName,
    city: req.body.city,
    companyAddress: req.body.companyAddress,
    state: req.body.state,
    postalCode: req.body.postalCode,
    callerIdName: req.body.callerIdName,
    user: user._id,
  });
  companyInfo = await companyInfo.save();

  res.send(
    _.pick(companyInfo, [
      "_id",
      "companyName",
      "city",
      "companyAddress",
      "state",
      "postalCode",
      "callerIdName",
      "user",
    ])
  );
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const compnayInfo = await CompanyInfo.findByIdAndUpdate(
    req.params.id,
    {
      companyName: req.body.companyName,
      city: req.body.city,
      companyAddress: req.body.companyAddress,
      state: req.body.state,
      postalCode: req.body.postalCode,
      callerIdName: req.body.callerIdName,
      user: req.user._id,
    },
    { new: true }
  );

  if (!compnayInfo)
    return res
      .status(404)
      .send("The compnayInfo with the given ID was not found.");

  res.send(compnayInfo);
});

router.delete("/:id", auth, async (req, res) => {
  const comapanyinfo = await CompanyInfo.findByIdAndRemove(req.params.id);

  if (!comapanyinfo)
    return res
      .status(404)
      .send("The compnayInfo with the given ID was not found.");

  res.send(compnayInfo);
});

router.get("/:id", auth, async (req, res) => {
  const comapanyinfo = await CompanyInfo.findById(req.params.id);

  if (!comapanyinfo)
    return res
      .status(404)
      .send("The comapanyinfo with the given ID was not found.");

  res.send(comapanyinfo);
});

module.exports = router;
