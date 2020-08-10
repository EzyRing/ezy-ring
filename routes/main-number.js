const { MainNumber, validate } = require("../models/main-number");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  let numbers;
  if (req.query.by) {
    numbers = await MainNumber.find()
      .sort("region")
      .select(req.query.by)
      .distinct("region");
    //numbers = await numbers;
  } else if (req.query.region && !req.query.areaCode) {
    numbers = await MainNumber.find({
      region: req.query.region,
    })
      .sort("areaCode")
      .select("areaCode");
  } else if (req.query.region && req.query.areaCode) {
    numbers = await MainNumber.find({
      region: req.query.region,
      areaCode: req.query.areaCode,
    })
      .sort("number")
      .select("number");
  } else {
    numbers = await MainNumber.find().sort("region");
  }

  res.send(numbers);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let mainNumber = new MainNumber({
    region: req.body.region,
    areaCode: req.body.areaCode,
    number: req.body.number,
    isLocal: req.body.isLocal,
    isTaken: req.body.isTaken,
  });
  mainNumber = await mainNumber.save();

  res.send(mainNumber);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const mainNumber = await MainNumber.findByIdAndUpdate(
    req.params.id,
    {
      region: req.body.region,
      areaCode: req.body.areaCode,
      number: req.body.number,
      isLocal: req.body.isLocal,
      isTaken: req.body.isTaken,
    },
    { new: true }
  );

  if (!mainNumber)
    return res
      .status(404)
      .send("The mainNumber with the given ID was not found.");

  res.send(mainNumber);
});

router.delete("/:id", async (req, res) => {
  const mainNumber = await MainNumber.findByIdAndRemove(req.params.id);

  if (!mainNumber)
    return res
      .status(404)
      .send("The mainNumber with the given ID was not found.");

  res.send(mainNumber);
});

router.get("/:id", async (req, res) => {
  const mainNumber = await MainNumber.findById(req.params.id);

  if (!mainNumber)
    return res
      .status(404)
      .send("The mainNumber with the given ID was not found.");

  res.send(plan);
});

module.exports = router;
