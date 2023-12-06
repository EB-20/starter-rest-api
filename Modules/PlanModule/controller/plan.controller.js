// const planDetailsSchema = require('../model/planDetails.model');
const planSchema = require('../model/plan.model');
const orgSchema = require('../../../model/orgs.model');
const userSchema = require('../../../model/user.model');
const coveredAndNotCoveredSchema = require('../../../model/coveredNotCovered');

const fetchPlanDetails = async (req, res) => {
    try {
        const activePlan = await planSchema.findOne({ planStatus: 'ACTIVE' });
        if (!activePlan) {
            res.status(400).json({ status: "error", message: "Active plan not found" });
            return;
        }
        // const activePlanDetails = await planDetailsSchema.findOne({planId:activePlan.planId});
        const planPrice = activePlan.planPrice
        res.status(200).json({ status: "success", message: "successfully fetched plan details", data: { planId: activePlan._id, planName: activePlan.planName, planDetail: activePlan.planPrice } });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
}
const ageCountPlan = async (req, res) => {
    try {
        let ageCount = {};
        let planPriceCount = {};
        let totalPrice = 0;
        let totalEmpCount = 0;
        let { planType, planDetail } = req.body
        const activePlan = await planSchema.findOne({ planStatus: 'ACTIVE' })
        console.log(activePlan,">>>>>>>>>>>>>>>");
        if (!activePlan) {
            res.status(400).json({ status: "error", message: "Plan not found" });
            return;
        }
        // const activePlanDetails = await planDetailsSchema.findOne({planId:activePlan.planId});
        // if(!activePlanDetails){
        //     res.status(400).json({status:"error" , message:"Plan details not found"});
        //     return;
        // }
        const user = req.user;
        if (user.userJourneyStatus !== 'STEP2') {
            res.status(400).json({ status: "error", message: "Please enter plan info to proceed" });
            return;
        }
        const orgId = user.orgId;
        const org = await orgSchema.findById({ _id: orgId });
        if (!org) {
            res.status(400).json({ status: "error", message: "Org not not found" });
            return;
        }
        if (org.empAgeCount) {
            res.status(400).json({ status: "error", message: "Plan already active" });
            return;
        }
        const activePlanPrice = activePlan.planPrice
        for (let i = 0; i < planDetail.length; i++) {
            var ageBand = planDetail[i].ageBand;
            var count = planDetail[i].count;
            ageCount[ageBand] = Number(count);
            var ageCountArr = activePlanPrice.filter((price) => {
                if (price.ageBand === ageBand) {
                    totalEmpCount += Number(count);
                    totalPrice += count * price[planType]
                    planPriceCount[ageBand] = Number(price[planType]);
                }
            })
        }
        if (totalEmpCount > org.totalEmployee) {
            res.status(400).json({ status: "error", message: "Employees enrolled must be less than or equal to total employees" })
            return;
        }
        console.log("ASsas");
        org.empAgeCount = ageCount;
        org.planId = activePlan._id
        org.planType = planType
        org.totalPlanPrice = (totalPrice * 12);
        user.userJourneyStatus = 'STEP3'
        await user.save();
        await org.save();
        res.status(200).json({
            status: "success", message: "successfully added members", data: {
                totalEmployee: totalEmpCount,
                totalPrice: totalPrice
            }
        })
    } catch (error) {
        res.status({ status: "error", message: error.message })
        console.log(error,"ASASAS");
    }
}
const fetchCoveredNotCovered = async (req,res)=>{
    const coveredAndNotCoveredSchemaExist = await coveredAndNotCoveredSchema.findOne({
        coveredNotCovered: { $exists: true },
      });
      console.log(coveredAndNotCoveredSchemaExist);
      if(!coveredAndNotCoveredSchemaExist){
        return res.status(400).json({status:"error",message:"Covered Not covered not found"});
      }
      res.status(200).json(coveredAndNotCoveredSchemaExist.coveredNotCovered)
}

module.exports = { ageCountPlan, fetchPlanDetails ,fetchCoveredNotCovered}