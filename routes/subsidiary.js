const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const { Subsidiary, validate } = require("../models/subsidiary");
const { CompanyInfo } = require("../models/companyinfo");
const _ = require("lodash");
const Fawn = require("fawn");

router.get("/", [auth, admin], async (req, res) => {
  const info = await CompanyInfo.findOne(
    { user: req.user._id }
    //{ companyName: 1, _id: 1, subsidiary: 1 }
  ).select("subsidiary");
  //console.log(info);

  if (info == null) {
    return res.status(400).send("Company is not saved by the user");
  }
  await info.populate("subsidiary").execPopulate();
  res.send(info);
  // //info = info[0];
  // console.log(info);
  // if (info != null) {
  //   res.send(info);
  // } else {
  //   return res.status(400).send("Company is not saved by the user");
  // }

  //const viewer = await subsidiaries.populate("viewer").execPopulate();
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).send("Invalid UserId.");

  let info = await CompanyInfo.findOne(
    { user: req.user._id },
    { companyName: 1, _id: 1, subsidiary: 1 }
  );

  //console.log(info);
  if (info != null) {
    await info.populate("subsidiary").execPopulate();
  } else {
    return res.status(400).send("Company is not saved by the user");
  }
  //console.log(info);

  if (info.subsidiary.filter((e) => e.name === req.body.name).length > 0) {
    return res.status(400).send("Subsidary already exist");
  }

  let subsidiary = new Subsidiary({
    name: req.body.name,
  });

  try {
    new Fawn.Task()
      .save("subsidiary", subsidiary)
      .run()
      .then((result) => {
        // console.log(result[0].insertedId);
        info.subsidiary = info.subsidiary || [];
        info.subsidiary.push(result[0].insertedId);
        info.save();
      });

    res.send(subsidiary);
  } catch (ex) {
    res.status(500).send("Something failed." + ex);
  }
});

router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const subsidiary = await Subsidiary.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    {
      new: true,
    }
  );

  if (!subsidiary)
    return res
      .status(404)
      .send("The subsidiary with the given ID was not found.");

  res.send(subsidiary);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const subsidiary = await Subsidiary.findByIdAndRemove(req.params.id);

  if (!subsidiary)
    return res
      .status(404)
      .send("The subsidiary with the given ID was not found.");

  const company = await CompanyInfo.findOne({ user: req.user._id });

  company.subsidiary.remove(req.params.id);
  company.save();

  res.send(subsidiary);
});

Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};
module.exports = router;

// router.post("/viewerlogin", async (req, res) => {
//   const { error } = validate(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   let viewer = await Viewer.findOne({ name: req.body.name });
//   if (!viewer) return res.status(400).send("Invalid User.");

//   const validPassword = viewer.password.equals(req.body.password);
//   if (!validPassword) return res.status(400).send("Invalid email or password.");

//   const token = viewer.generateAuthToken();
//   res.send({
//     token: token,
//   });
// });
