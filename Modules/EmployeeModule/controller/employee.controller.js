const userSchema = require("../../../model/user.model");
const planSchema = require("../../PlanModule/model/plan.model");
const orgSchema = require("../../../model/orgs.model");
const nomineeRelationSchema = require("../../../model/nomineeRelation.model");
const userFamilySchema = require("../../../model/userFamilyDetails.model");
const org = require("../../../model/orgs.model");
require("dotenv").config();

const saveEmployeeFamilyDetails = async (req, res) => {
  const user = req.user;
  const { spouse, child1, child2, nominee } = req.body;
  const userDetails = await userSchema.findById(user._id);
  if (!spouse && !child1 && !child2) {
    return res
      .status(400)
      .json({ status: "error", message: "Please enter some Family Details" });
  }
  if (spouse) {
    if (!spouse.firstName) {
      return res
        .status(400)
        .json({ status: "error", message: "Please enter spouse first name." });
    }
    if (!spouse.gender) {
      return res
        .status(400)
        .json({ status: "error", message: "Please enter spouse gender." });
    }
    if (!spouse.dob) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Please enter spouse Date of Birth.",
        });
    }
    if (spouse.sDob) {
      let spouseDob = spouse.Dob;
      const getAge = (spouseDob) =>
        Math.floor((new Date() - new Date(spouseDob).getTime()) / 3.15576e10);
      let spouseAge = Math.abs(getAge(spouseDob));
      if (spouseAge < 18) {
        return res
          .status(400)
          .json({
            status: "error",
            message: "Spouse age cannot be less than 18 years",
          });
      }
    }
  }
  if (child1) {
    if (!child1.firstName) {
      return res
        .status(400)
        .json({ status: "error", message: "Please enter child 1 first name." });
    }
    if (!child1.gender) {
      return res
        .status(400)
        .json({ status: "error", message: "Please enter child 1 gender." });
    }
    if (!child1.dob) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Please enter child 1 Date of Birth.",
        });
    }
  }
  if (child2) {
    if (!child2.firstName) {
      return res
        .status(400)
        .json({ status: "error", message: "Please enter child 2 first name." });
    }
    if (!child2.gender) {
      return res
        .status(400)
        .json({ status: "error", message: "Please enter child 2 gender." });
    }
    if (!child2.dob) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Please enter child 2 Date of Birth.",
        });
    }
  }
  const family = new userFamilySchema({
    userId: user._id,
    orgId: user.orgId,
    spouse: spouse,
    childOne: child1,
    childTwo: child2,
    nominee,
  });
  await family.save();
  userDetails.familyId = family._id;
  await userDetails.save();
  res.status(200).json({
    status: "success",
    message: "Successfully added employee family details",
  });
};
const getEmpFamilyDetails = async (req, res) => {
  try {
    const user = req.user;
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter User Id to proceed" });
    }
    const family = await userFamilySchema.findById(user.familyId);
    if (!family) {
      return res
        .status(400)
        .json({ status: "error", message: "Family details Doesn't exists" });
    }
    const org = await orgSchema.findById(user.orgId);
    const plan = await planSchema.findById(user.planId);
    if (!plan) {
      return res
        .status(400)
        .json({ status: "error", message: "Plan Doesn't exists" });
    }
    res.status(200).json({
      status: "success",
      spouse: family.spouse,
      nominee:
        family.nominee === "child1"
          ? "childOne"
          : family.nominee === "child2"
          ? "childTwo"
          : family.nominee,
      childOne: family.childOne,
      childTwo: family.childTwo,
      planName: plan.planName,
      planExpiryDate: org.planExpiryDate,
      planStartDate: org.planStartDate,
      description: plan.planDesc,
      covered:plan.covered,
      notCovered: plan.notCovered,
    });
  } catch (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
};
const nomineeRelation = async (req, res) => {
  try {
    const user = req.user;
    const nomineeRelationData = await nomineeRelationSchema.find(
      {},
      { createdAt: 0, updatedAt: 0, __v: 0, _id: 0 }
    );
    if (!nomineeRelation) {
      return res
        .status(400)
        .json({ status: "error", message: "Nominee Relation data not found" });
    }
    res.status(200).json({ status: "success", nomineeRelationData });
  } catch (error) {
    return res.status(400).json({ status: "error", message: error.message });
  }
};
const addNominee = async (req, res) => {
  const user = req.user;
  let { nomineeDetails } = req.body;                   
  if (!nomineeDetails.name) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter nominee name to proceed" });
  }
  if (nomineeDetails.name==="child1") {
    nomineeDetails.name="childOne"
  }
  if (nomineeDetails.name==="child2") {
    nomineeDetails.name="childTwo"
  }
  if (!nomineeDetails.name) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter nominee name to proceed" });
  }
  if (!nomineeDetails.relation) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter nominee relation to proceed" });
  }
  if (!nomineeDetails.dob) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter nominee dob to proceed" });
  }
  const familyDetail = await userFamilySchema.findById(user.familyId);
  if (!familyDetail) {
    return res
      .status(400)
      .json({ status: "error", message: "family details not found" });
  }
  familyDetail.nomineeDetails = nomineeDetails;
  familyDetail.save();
  res
    .status(200)
    .json({ status: "success", message: "Successfully added nominee" });
};
module.exports = {
  saveEmployeeFamilyDetails,
  getEmpFamilyDetails,
  nomineeRelation,
  addNominee,
};
