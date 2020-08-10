const { PricingPlan, validate } = require("../models/pricing-plan");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const plan = await PricingPlan.find().sort("price");
  res.send(plan);
});

router.post("/", async (req, res) => {
  console.log(req.body);
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let plan = new PricingPlan({
    name: req.body.name,
    shortDiscription: req.body.shortDiscription,
    price: req.body.price,
    currency: req.body.currency,
    details: req.body.details,
  });
  plan = await plan.save();

  res.send(plan);
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const plan = await PricingPlan.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      shortDiscription: req.body.shortDiscription,
      price: req.body.price,
      currency: req.body.currency,
      details: {
        noOfUsers: req.body.details.noOfUsers,
        assignUsers: req.body.details.assignUsers,
        company: req.body.details.assignUsers,
      },
    },
    { new: true }
  );

  if (!plan)
    return res.status(404).send("The pricing with the given ID was not found.");

  res.send(plan);
});

router.delete("/:id", async (req, res) => {
  const plan = await PricingPlan.findByIdAndRemove(req.params.id);

  if (!plan)
    return res.status(404).send("The pricing with the given ID was not found.");

  res.send(plan);
});

router.get("/:id", async (req, res) => {
  const plan = await PricingPlan.findById(req.params.id);

  if (!plan)
    return res.status(404).send("The pricing with the given ID was not found.");

  res.send(plan);
});

module.exports = router;
