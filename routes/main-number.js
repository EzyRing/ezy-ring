const { MainNumber, validate } = require("../models/main-number");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  //handling query parameters
  // this needs to be done(**)
  const numbers = await MainNumber.find().sort("region");
  res.send(numbers);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let mainNumber = new MainNumber({
    region: req.body.region,
    areaCode: req.body.areaCode,
    number: req.body.number,
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
