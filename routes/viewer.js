const { Viewer, validate } = require("../models/viewer");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const { CompanyInfo } = require("../models/companyinfo");
//const { Subsidiary } = require("../models/subsidiaries");
const _ = require("lodash");
const Fawn = require("fawn");
const { Subsidiary } = require("../models/subsidiary");
const { PhoneNumber } = require("../models/phone-number");

router.post("/viewerlogin", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let viewer = await Viewer.findOne({ name: req.body.name });
  if (!viewer) return res.status(400).send("Invalid User.");

  const validPassword = viewer.password.equals(req.body.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = viewer.generateAuthToken();
  res.send({
    token: token,
  });
});

router.get("/", [auth, admin], async (req, res) => {
  if (req.query.subsidiary) {
    const info = await CompanyInfo.findOne({
      user: req.user._id,
    }).select("subsidiary -_id");

    if (!info) {
      return res.status(400).send("No Such Company or Subsidiary Exist");
    }

    const subsidiary = await Subsidiary.findById(req.query.subsidiary).select(
      "viewer"
    );
    if (!subsidiary) {
      return res.status(400).send("Subsidiary Doesnt Exist");
    }

    await subsidiary
      .populate("viewer")
      .populate({
        path: "viewer",
        populate: {
          path: "number",
          model: "phoneNumber",
        },
      })
      .execPopulate();
    return res.send(subsidiary);
  }
  // }

  const info = await CompanyInfo.findOne({
    user: req.user._id,
  }).select("subsidiary -_id");

  if (!info) {
    return res.status(400).send("No Such Company or Subsidiary Exist");
  }

  await info
    .populate("subsidiary")
    .populate({
      path: "subsidiary",
      populate: {
        path: "viewer",
        model: "viewer",
        populate: {
          path: "number",
          model: "phoneNumber",
        },
      },
    })
    .execPopulate();

  res.send(info.subsidiary);

  res.send(info.subsidiary);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(req.user._id);
  if (!user) return res.status(400).send("Invalid UserId.");

  let info = await CompanyInfo.findOne({
    subsidiary: { $in: req.body.subsidiary },
  });

  if (!info) {
    return res.status(400).send("No Such Company or Subsidiary Exist");
  }

  let subsidiary = await (
    await Subsidiary.findById(req.body.subsidiary).populate("viewer")
  ).execPopulate();
  //save viewer object

  if (subsidiary.viewer.filter((e) => e.name === req.body.name).length > 0) {
    return res.status(400).send("Viewer already exist");
  }

  let viewer = new Viewer({
    name: req.body.name,
    password: "12345",
  });

  // viewer = await viewer.save();
  // res.send(_.pick(viewer, ["name"]));

  await subsidiary.populate("subsidiary").populate("viewer").execPopulate();

  try {
    new Fawn.Task()
      .save("viewer", viewer)
      .run()
      .then((result) => {
        // console.log(result[0].insertedId);
        subsidiary.viewer = subsidiary.viewer || [];
        subsidiary.viewer.push(result[0].insertedId);
        subsidiary.save();
      });

    res.send(viewer);
  } catch (ex) {
    res.status(500).send("Something failed." + ex);
  }
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const viewer = await Viewer.findByIdAndRemove(req.params.id);

  if (!viewer)
    return res.status(404).send("The viewer with the given ID was not found.");
  const subsidary = await Subsidiary.findOne({ viewer: req.params.id });

  if (subsidary) {
    subsidary.viewer.remove(req.params.id);
    subsidary.save();
  }

  const number = await PhoneNumber.find({ viewer: { $in: [req.params.id] } });
  if (number) {
    PhoneNumber.updateMany(
      { viewer: { $in: [req.params.id] } },
      { viewer: null },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log("Updated Docs : ", docs);
        }
      }
    );
  }
  res.send(viewer);
});

router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const viewer = await Viewer.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, password: req.body.password },
    {
      new: true,
    }
  );

  if (!viewer)
    return res.status(404).send("The viewer with the given ID was not found.");

  res.send(viewer);
});

router.post("/addnumber/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const number = await PhoneNumber.findOne({ _id: req.body.id });
  if (!number) return res.status(404).send("The number was not found.");

  if (number.viewer != null) {
    return res.status(400).send("Number Already Taken By the viewer");
  }

  const viewer = await Viewer.findById(req.params.id);
  if (!viewer)
    return res.status(404).send("The viewer with the given ID was not found.");
  viewer.number = viewer.number || [];
  viewer.number.push(number._id);
  viewer.save();

  const phone = await PhoneNumber.findByIdAndUpdate(
    number._id,
    { viewer: viewer._id },
    {
      new: true,
    }
  );

  res.send(viewer);
});

router.post("/deletenumber/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const number = await PhoneNumber.findOne({ _id: req.body.id });
  if (!number) return res.status(404).send("The number was not found.");

  if (number.viewer == null) {
    return res.status(400).send("Number Already Deleted for the viewer");
  }

  const viewer = await Viewer.findById(req.params.id);
  if (!viewer)
    return res.status(404).send("The viewer with the given ID was not found.");
  viewer.number.remove(number._id);
  viewer.save();

  const phone = await PhoneNumber.findByIdAndUpdate(
    number._id,
    { viewer: null },
    {
      new: true,
    }
  );
  res.send(viewer);
});

module.exports = router;
