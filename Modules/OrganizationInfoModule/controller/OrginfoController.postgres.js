// const orgSchema = require("../../../PostgresModels/orgs.model");
// const userSchema = require("../../../PostgresModels/user.model");
// const pinSchema = require("../../../PostgresModels/pin.model");

const {
  userSchema: userSchema,
  orgs: orgSchema,
  pin: pinSchema,
} = require("../../../PostgresModels");
const saveOrgNameGst = async (req, res) => {
  try {
    const {
      companyName,
      companyGstNumber,
      partOfSEZ,
      addressLine1,
      addressLine2,
      pincode,
    } = req.body;
    if (!companyName) {
      res
        .status(400)
        .json({
          status: "error",
          message: "Please enter company name to proceed",
        });
      return;
    }
    if (!companyGstNumber) {
      res.status(400).json({
        status: "error",
        message: "Please enter company gst Number to proceed",
      });
      return;
    }
    if (!addressLine1) {
      res.status(400).json({
        status: "error",
        message: "Please enter adress to proceed",
      });
      return;
    }
    if (!addressLine2) {
      res.status(400).json({
        status: "error",
        message: "Please enter address to proceed",
      });
      return;
    }
    if (!pincode) {
      res.status(400).json({
        status: "error",
        message: "Please enter pincode to proceed",
      });
      return;
    }
    const user = req.user;
    let orgDetails = {};
    const currentUser = await userSchema.findOne({ where: { id: user.id } });
    let sadmin = await userSchema.findOne({
      where: { superAdminId: user.superAdminId },
    });
    if (!sadmin) {
      return res
        .status(400)
        .json({ status: "error", message: "Super Admin not found" });
    }
    const stateCity = await pinSchema.findOne({ pincode: pincode });
    if (stateCity !== null) {
      if (user.phoneNoVerified) {
        const orgName = await orgSchema.findOne({
          where: { orgName: companyName },
        });
        if (orgName) {
          res
            .status(400)
            .json({
              status: "error",
              message: "Company name is already registered",
            });
          return;
        }
        const org = await orgSchema.findOne({
          where: { companyGstNumber: companyGstNumber },
        });
        if (org) {
          res
            .status(400)
            .json({
              status: "error",
              message: "Company gst is already registered",
            });
          return;
        }
        const adminOrg = await orgSchema.findOne({
          where: { phoneNumber: user.userphoneNumber },
        });
        if (!adminOrg) {
          res.status(400).json({ status: "error", message: "Signup First" });
          return;
        }
        orgDetails.orgName = companyName;
        orgDetails.companyGstNumber = companyGstNumber;
        orgDetails.partOfSEZ = partOfSEZ;
        orgDetails.addressLine1 = addressLine1;
        orgDetails.addressLine2 = addressLine2;
        orgDetails.city = stateCity.districtName;
        orgDetails.state = stateCity.stateName;
        orgDetails.pincode = pincode;
        orgDetails.adminId = user.id;
        orgDetails.wlsPath = sadmin.wlsPath;
        await adminOrg.update(orgDetails, {
          where: { id: adminOrg.dataValues.id },
        });
        user.orgId = adminOrg.id;
        user.userJourneyStatus = "STEP1";
        await currentUser.update(user, { where: { id: user.id } });
        res
          .status(200)
          .json({ status: "success", message: "Succesfully added company" });
      } else {
        res
          .status(400)
          .json({
            status: "error",
            message: "Please verify phone number to continue",
          });
      }
    } else {
      res.status(400).json({ status: "error", message: "Invalid PIN Code" });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error });
    console.log(error, "error");
  }
};
const saveOrgDetails = async (req, res) => {
  try {
    const { userName, userMail, totalEmpCount } = req.body;
    const user = req.user;
    if (!userMail) {
      res
        .status(400)
        .json({ status: "error", message: "Please Enter email to proceed" });
      return;
    }
    if (!userName) {
      res
        .status(400)
        .json({ status: "error", message: "Please Enter username to proceed" });
      return;
    }
    if (!totalEmpCount) {
      res
        .status(400)
        .json({
          status: "error",
          message: "Please Enter total employee count to proceed",
        });
      return;
    }
    if (totalEmpCount < 7) {
      res
        .status(400)
        .json({
          status: "error",
          message: "Total employees should be more than or equal to 7",
        });
      return;
    }
    if (user.userJourneyStatus !== "STEP1") {
      res
        .status(400)
        .json({
          status: "error",
          message: "Please enter previous org details to proceed",
        });
      return;
    }
    const currentUser = await userSchema.findOne({ where: { id: user.id } });
    const mail = await userSchema.findOne({ where: { userMail: userMail } });
    if (mail) {
      res
        .status(400)
        .json({ status: "error", message: "User email already exists" });
      return;
    }
    const company = await orgSchema.findOne({ where: { id: user.orgId } });
    await currentUser.update(
      { userName, userMail, userJourneyStatus: "STEP2" },
      { where: { id: user.id } }
    );
    await company.update(
      { eMail: userMail, totalEmployee: totalEmpCount },
      { where: { id: company.dataValues.id } }
    );
    res
      .status(200)
      .json({
        status: "success",
        message: "successfully added company details",
      });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const orgProfile = async (req, res) => {
  try {
    const user = req.user;
    console.log(user, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    if (user.role !== "ADMIN") {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    } else {
      let org = await orgSchema.findOne({ where: { id: user.orgId } });
      if (!org) {
        res
          .status(401)
          .json({ status: "error", message: "Company not registered" });
      } else {
        org=org.dataValues
        if (
          !org.orgName ||
          !org.companyGstNumber ||
          !user.userMail ||
          !user.userphoneNumber ||
          !org.city ||
          !org.state
        ) {
          res
            .status(400)
            .json({ status: "error", message: "Company is not registered" });
        } else {
          res.status(200).json({
            status: "success",
            data: {
              organizationName: org.orgName,
              gstNo: org.companyGstNumber,
              userMail: user.userMail,
              pincode: org.pincode,
              phoneNo: user.userphoneNumber,
              addressLine1: org.addressLine1,
              addressLine2: org.addressLine2,
              city: org.city,
              state: org.state,
            },
          });
        }
      }
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

module.exports = { saveOrgNameGst, saveOrgDetails, orgProfile };
