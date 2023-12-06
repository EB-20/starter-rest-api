// // const planDetailsSchema = require('../model/planDetails.model');
// const planSchema = require('../model/plan.model.postgres');
// const orgSchema = require('../../../PostgresModels/orgs.model');
// const userSchema = require('../../../PostgresModels/user.model');
// const coveredAndNotCoveredSchema = require('../../../PostgresModels/coveredNotCovered');
const { Op } = require("sequelize");
const {
  userSchema,
  planSchema,
  orgs: orgSchema,
  coveredNotCovered: coveredAndNotCoveredSchema,
  planPriceTable,
} = require("../../../PostgresModels");
const planPriceCountData = {
  monthlyPrice: 1,
  quarterlyPrice: 4,
  halfYearlyPrice: 6,
  annuallyPrice: 12,
};
const fetchPlanDetails = async (req, res) => {
  try {
    const activePlan = await planSchema.findOne({
      where: { planStatus: "ACTIVE" },
    });
    // console.log(activePlan,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    if (!activePlan) {
      res
        .status(400)
        .json({ status: "error", message: "Active plan not found" });
      return;
    }
    console.log(activePlan);
    const fetchPlanPrice = await planPriceTable.findAll({
      where: { planSchemaId: activePlan.dataValues.id },
    });
    if (!fetchPlanPrice) {
      res
        .status(400)
        .json({ status: "error", message: "Active plan Price not found" });
      return;
    }
    // const activePlanDetails = await planDetailsSchema.findOne({planId:activePlan.planId});
    // const planPrice = activePlan.dataValues.planPrice
    res.status(200).json({
      status: "success",
      message: "successfully fetched plan details",
      data: {
        planId: activePlan.dataValues.id,
        planName: activePlan.dataValues.planName,
        planDetail: fetchPlanPrice,
      },
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const ageCountPlan = async (req, res) => {
  try {
    let ageCount = {};
    let planPriceCount = {};
    let totalPrice = 0;
    let totalEmpCount = 0;
    let { planType, planDetail } = req.body;
    const activePlan = await planSchema.findOne({
      where: { planStatus: "ACTIVE" },
    });
    if (!activePlan) {
      res.status(400).json({ status: "error", message: "Plan not found" });
      return;
    }
    const fetchPlanPrice = await planPriceTable.findAll({
      where: { planSchemaId: activePlan.dataValues.id },
    });
    console.log(
      fetchPlanPrice,
      ">>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<SSSSSSSSSSSSSSSSSSSS"
    );
    if (!fetchPlanPrice) {
      res
        .status(400)
        .json({ status: "error", message: "Active plan Price not found" });
      return;
    }
    activePlan.dataValues.planPrice = fetchPlanPrice;
    console.log(
      activePlan.planPrice,
      ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
    );
    // const activePlanDetails = await planDetailsSchema.findOne({planId:activePlan.planId});
    // if(!activePlanDetails){
    //     res.status(400).json({status:"error" , message:"Plan details not found"});
    //     return;
    // }
    const user = req.user;
    if (user.userJourneyStatus !== "STEP2") {
      res.status(400).json({
        status: "error",
        message: "Please enter plan info to proceed",
      });
      return;
    }
    const orgId = user.orgId;
    const org = await orgSchema.findOne({ where: { id: orgId } });
    console.log(org, ">>>>>>>>>>>>>>>>>>>>");
    if (!org) {
      res.status(400).json({ status: "error", message: "Org not not found" });
      return;
    }
    if (org.dataValues.empAgeCount) {
      res.status(400).json({ status: "error", message: "Plan already active" });
      return;
    }
    const activePlanPrice = activePlan.dataValues.planPrice;
    for (let i = 0; i < planDetail.length; i++) {
      var ageBand = planDetail[i].ageBand;
      var count = planDetail[i].count;
      ageCount[ageBand] = Number(count);
      var ageCountArr = activePlanPrice.filter((price) => {
        if (price.ageBand === ageBand) {
          totalEmpCount += Number(count);
          totalPrice += count * price[planType];
          planPriceCount[ageBand] = Number(price[planType]);
        }
      });
    }
    console.log(
      totalEmpCount,
      org.dataValues.totalEmployee,
      ">>>sabrywegyfgdtfathfAYTwfadagh"
    );
    if (totalEmpCount > org.dataValues.totalEmployee) {
      res.status(400).json({
        status: "error",
        message:
          "Employees enrolled must be less than or equal to total employees",
      });
      return;
    }

    await orgSchema.update(
      {
        empAgeCount: ageCount,
        planId: activePlan.dataValues.id,
        planType: planType,
        totalPlanPrice: totalPrice * planPriceCountData[planType],
      },
      { where: { id: org.dataValues.id } }
    );
    await userSchema.update(
      { userJourneyStatus: "STEP3" },
      { where: { id: user.id } }
    );

    res.status(200).json({
      status: "success",
      message: "successfully added members",
      data: {
        totalEmployee: totalEmpCount,
        totalPrice: totalPrice,
      },
    });
  } catch (error) {
    res.status({ status: "error", message: error.message });
    console.log(error);
  }
};
const fetchCoveredNotCovered = async (req, res) => {
  const coveredAndNotCoveredSchemaExist =
    await coveredAndNotCoveredSchema.findOne({
      where: {
        coveredNotCovered: { id: 1 },
      },
    });
  console.log(coveredAndNotCoveredSchemaExist);
  if (!coveredAndNotCoveredSchemaExist) {
    return res
      .status(400)
      .json({ status: "error", message: "Covered Not covered not found" });
  }
  res.status(200).json(coveredAndNotCoveredSchemaExist);
};

module.exports = { ageCountPlan, fetchPlanDetails, fetchCoveredNotCovered };
