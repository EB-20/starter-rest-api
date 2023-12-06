const orgSchema = require("../../../model/orgs.model");
const orderModel = require("../../PaymentModule/model/payment.model");
const userSchema = require("../../../model/user.model");
const planSchema = require("../../PlanModule/model/plan.model");
const roleSchema = require("../../../model/role.model");
const pinSchema = require("../../../model/pin.model")
const { uploadToS3Bucket } = require("../../../utils/s3Config");
const { createJwtToken } = require("../../../utils/token.utils");
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");
require("dotenv").config();

const allOrgDetails = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10, orgName = "", status = "ALL" } = req.query;
    skip = (pageNo - 1) * limit;
    const user = req.user;
    const regx = new RegExp(`^${orgName}`, "i");
    let orgInfo;
    let totalOrg;
    let totalPages;

    if (user.role !== "SADMIN") {
      res.status(400).json({ status: "error", message: "Unauthorized" });
    } else {
      totalOrg = await orgSchema
      .find().count();
      if (status === "ALL" || !status) {
        orgInfo = await orgSchema
          .find({ orgName: { $regex: regx } })
          .limit(limit)
          .skip(skip);
        totalPages = Math.ceil(totalOrg / Number(limit));
      } else {
        orgInfo = await orgSchema
          .find({
            $and: [
              { regStatus: { $eq: status } },
              { orgName: { $regex: regx } },
            ]
          }).limit(limit).skip(skip);
        total = await orgSchema
          .find({
            $and: [
              { regStatus: { $eq: status } },
              { orgName: { $regex: regx } },
            ],
          })
          .count();
        totalPages = Math.ceil(total / Number(limit));
      }
      const activeOrg = await orgSchema
        .find({ regStatus: { $eq: "ACTIVE" } })
        .count();
      const notActiveOrg = await orgSchema
        .find({ regStatus: { $eq: "NON-ACTIVE" } })
        .count();
      res.status(200).json({
        status: "success",
        data: {
          orgData: orgInfo,
          currentPage: pageNo,
          activeOrg: activeOrg,
          notActiveOrg: notActiveOrg,
          totalPages,
          totalOrg,
          limit,
        },
      });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const getInvoiceDetails = async (req, res) => {
  try {
    const { orgId } = req.query;
    if (!orgId) {
      res
        .status(400)
        .json({ status: "error", message: "Enter orgId to fetch invoice" });
      return;
    }
    orderDetails = await orderModel.find({ orgId: orgId });
    orderDetails = await orderModel.find({ orgId: orgId });
    invoiceCount = await orderModel.find({ orgId: orgId }).count();
    if (!orderDetails) {
      return res
        .status(400)
        .json({ status: "error", message: "Order details not exist" });
    }
    return res.status(200).json({
      status: "success",
      data: orderDetails,
      invoiceCount: invoiceCount,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const orgEmpDetails = async (req, res) => {
  try {
    const {
      orgId,
      pageNo = 1,
      limit = 10,
      status = "ALL",
      searchParam,
    } = req.query;
    skip = (pageNo - 1) * limit;
    let empData;
    let empCount;
    if (!orgId) {
      res.status(400).json({ status: "error", message: "Provide Org ID" });
    } else {
      if (!searchParam || searchParam === undefined) {
        empData = await userSchema
          .find({ orgId: orgId })
          .limit(limit)
          .skip(skip);
        empCount = await userSchema.find({ orgId: orgId }).count();
      } else {
        empData = await userSchema
          .find({
            $and: [
              { orgId: orgId },
              {
                $or: [
                  { userName: { $regex: searchParam, $options: "i" } },
                  { userphoneNumber: { $regex: searchParam, $options: "i" } },
                  { userMail: { $regex: searchParam, $options: "i" } },
                ],
              },
            ],
          })
          .limit(limit)
          .skip(skip);
        empCount = await userSchema.find({ orgId: orgId }).count();
      }
      const totalPages = Math.ceil(empCount / Number(limit));
      res
        .status(200)
        .json({ status: "success", empData, empCount, totalPages, limit });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const userDetails = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter order ID to proceed" });
    }
    const order = await orderModel.findOne({ orderId: orderId });
    if (!orderId) {
      return res
        .status(400)
        .json({ status: "error", message: "Order doesn't exists" });
    }
    const user = await userSchema.findById(order.userId);
    const org = await orderModel.findById(order.orgId);
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "User doesn't exists" });
    }
    const token = createJwtToken({ user: user._id, role: user.role });
    user.token = token;
    await user.save();
    res.status(200).json({
      data: {
        orgId: user.orgId,
        superAdminId: user.superAdminId,
        planId: user.planId,
        empId: user.empId,
        userName: user.userName,
        dob: user.dob,
        doj: user.doj,
        gender: user.gender,
        addressLineOne: user.addressLineOne,
        addressLineTwo: user.addressLineTwo,
        pinCode: user.pinCode,
        state: user.state,
        city: user.city,
        userphoneNumber: user.userphoneNumber,
        role: user.role,
        userMail: user.userMail,
        token: user.token,
      },
      status: "success",
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const adminRegForm = async (req, res) => {
  try {
    const user = req.user;
    const { orgDetails, userDetails } = req.body;
    if (user.role !== "SADMIN") {
      return res.status(400).json({ status: "error", message: "Unauthorized" });
    }
    if (!orgDetails?.companyGstNumber) {
      return res.status(400).json({
        status: "error",
        message: "Enter Company GST number to proceed",
      });
    }
    if (orgDetails?.partOfSEZ === null || orgDetails?.partOfSEZ === undefined) {
      return res
        .status(400)
        .json({ status: "error", message: "Select Part of SEZ to proceed" });
    }
    if (!orgDetails?.addressLine1) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter Address Line 1 to proceed" });
    }
    if (!orgDetails?.addressLine2) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter Address Line 2 to proceed" });
    }
    if (!orgDetails?.pincode) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter PIN code to proceed" });
    }
    if (!orgDetails?.totalEmployee) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter Total Employee to proceed" });
    }
    if (!orgDetails?.orgName) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter Company Name to proceed" });
    }
    if (!userDetails?.role) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter User Role to proceed" });
    }
    if (!userDetails?.userphoneNumber) {
      return res.status(400).json({
        status: "error",
        message: "Enter User Phone Number to proceed",
      });
    }
    if (!userDetails?.userName) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter User Name to proceed" });
    }
    if (!userDetails?.userMail) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter User Email to proceed" });
    }
    const pinExists  = await pinSchema.findOne({pincode:orgDetails.pincode})
    if(!pinExists){
      return res.status(400).json({status:"error",message:"Invalid Pin Code"})
    }
    const adminExists = await orgSchema.findOne({ companyGstNumber: orgDetails.companyGstNumber });
    if (adminExists) {
      res
        .status(400)
        .json({
          status: "error",
          message: "Company GST number already exists",
        });
      return;
    }
    const companyNameExists = await orgSchema.findOne({ orgName: orgDetails.orgName });
    if (companyNameExists) {
      res
        .status(400)
        .json({
          status: "error",
          message: "Company name already exists",
        });
      return;
    }
    const userphoneNumberExists = await userSchema.findOne({ userphoneNumber: userDetails.userphoneNumber });
    if (userphoneNumberExists) {
      res
        .status(400)
        .json({
          status: "error",
          message: "User mobile number already exists",
        });
      return;
    }
    const userMailExists = await userSchema.findOne({ userMail: userDetails.userMail });
    if (userMailExists) {
      res
        .status(400)
        .json({
          status: "error",
          message: "User mail already exists",
        });
      return;
    }
    const activePlan = await planSchema.findOne({planStatus:"ACTIVE"})
    if(!activePlan){
    return res.status(400).json({ status: "error", message: error.message });
    }
    userDetails.superAdminId = user._id;
    userDetails.planId = activePlan._id
    userDetails.phoneNoVerified = true
    userDetails.userJourneyStatus = "STEP2"
    orgDetails.planId = activePlan._id
    userDetails.role = userDetails.role.toUpperCase()
    const createNewUser = new userSchema(userDetails);
    const createNewOrg = new orgSchema(orgDetails);
    await createNewUser.save();
    await createNewOrg.save();
    const createdUser = await userSchema.findOne({userphoneNumber:userDetails.userphoneNumber})
    const createdOrg = await orgSchema.findOne({companyGstNumber:orgDetails.companyGstNumber})
    createNewUser.orgId = createdOrg._id
    createdOrg.adminId = createdUser._id
    await createNewUser.save()
    await createdOrg.save()
    res.status(200).json({
      status: "success",
      message: "Successfully Added new Admin",
      data: {
        orgDetails,
        userDetails,
      },
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const sadminFetchPlan = async (req, res) => {
  try {
    const user = req.user;
    if (!user.role === "ADMIN" || !user.role === "SADMIN") {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const planDetails = await planSchema.aggregate([
      { $match: {} },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "planId",
          as: "userData",
        },
      },
      {
        $lookup: {
          from: "orgs",
          localField: "_id",
          foreignField: "planId",
          as: "orgsData",
        },
      },
      {
        $project: {
          planName: 1,
          planId: 1,
          planStatus: 1,
          planDesc: 1,
          planLogoPath: 1,
          numberorgsData: { $size: "$orgsData" },
          numberuserData: { $size: "$userData" },
        },
      },
    ]);
    const planCount = await planSchema.find().count();
    // for(let i=0;i<planDetails.length;i++){
    //   let path = planDetails[i].planLogoPath
    //   const s3 = new S3({
    //     region: process.env.REGION,
    //     accessKeyId: process.env.ACCESSKEYID,
    //     secretAccessKey: process.env.SECRETACCESSKEY
    //   });
    //   if(path!==undefined){
    //     const url = await new Promise((resolve, reject) => {
    //       const params = {
    //         Bucket: process.env.BUCKET,
    //         Key: planDetails[i].planLogoPath
    //       }
    //       s3.getObject(params,function (err, data) {
    //         if (err) reject(err)
    //         else {
    //           resolve(data.Body)
    //         }
    //       })

    //     })
    //     planDetails[i].image = url
    //   }
    //   else{
    //     continue;
    //   }
    //   // console.log(logo);
    // }
    res.status(200).json({ status: "success", planDetails, planCount });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const addNewPlan = async (req, res) => {
  try {
    const user = req.user;
    let uploadFilePath = user.planLogoPath
    // if (req.file?.filename === null || req.file?.filename === undefined) {
    //   return res
    //     .status(400)
    //     .json({ status: "error", message: "Provide company logo to proceed" });
    // }
    if (req.body?.planName === null || req.body?.planName === undefined) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter plan name to proceed" });
    }
    if (req.body?.planId === null || req.body?.planId === undefined) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter plan Id to proceed" });
    }
    if (req.body?.description === null || req.body?.description === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Enter plan Description to proceed",
      });
    }
    if (req.body?.plans === null || req.body?.plans === undefined) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter plan age band to proceed" });
    }
    if (req.body?.notCovered === null || req.body?.notCovered === undefined) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter Not Covered in plan" });
    }
    if (req.body?.covered === null || req.body?.covered === undefined) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter Covered in plan" });
    }
    const planNameExists = await planSchema.findOne({
      planName: req.body.planName,
    });
    if (planNameExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Plan Name already exists" });
    }
    const planIdExists = await planSchema.findOne({ planId: req.body.planId });
    if (planIdExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Plan ID already exists" });
    }
    if (req.file?.filename) {
      const logoFile = fs.readFileSync(req.file.path);
      uploadFilePath = `EB/${user._id}/planlogo/${req.body.planId}/${req.file?.filename}`;
      uploadToS3Bucket(logoFile, uploadFilePath);
      await fs.unlink(`logoUpload/${req.file?.filename}`, (err) => {
        if (err) {
          console.log(
            `some error occured in removing the following file ${req.file?.path}`
          );
        }
      });
    }
    const newPlan = new planSchema({
      planId: req.body.planId,
      planName: req.body.planName,
      planDesc: req.body.description,
      planPrice: JSON.parse(req.body.plans),
      planLogoPath: uploadFilePath,
      notCovered: JSON.parse(req.body.notCovered),
      covered: JSON.parse(req.body.covered)
    });
    await newPlan.save()
    res.status(200).json({
      status: "success",
      message: `Added new plan with plan ID:${req.body.planId} successfully`,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const fetchOrgsWithPlan = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10, planId, orgName = "" } = req.query;
    skip = (pageNo - 1) * limit;
    const user = req.user;
    const regx = new RegExp(`^${orgName}`, "i");
    if (!planId) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter Plan ID to proceed" });
    }
    if (!user === "SADMIN") {
      return res.status(400).json({ status: "error", message: "Unauthorized" });
    }
    const fetchPlan = await planSchema.findOne({ planId: planId });
    if (!fetchPlan) {
      return res
        .status(400)
        .json({ status: "error", message: "Plan doesn't exists" });
    }
    const orgDetails = await orgSchema.find(
      { $and: [{ planId: fetchPlan._id }, { orgName: { $regex: regx } }, {}] },
      {
        orgName: 1,
        phoneNumber: 1,
        eMail: 1,
        companyGstNumber: 1,
        totalEmployee: 1,
      }
    );
    if (!orgDetails) {
      return res
        .status(400)
        .json({ status: "error", message: "No org active on this plan" });
    }
    res
      .status(200)
      .json({ status: "success", orgDetails, planDetails: fetchPlan });
  } catch (error) {
    res.status(200).json({ status: "error", message: error.message });
  }
};
const setPlan = async (req, res) => {
  try {
    const { planId, Active } = req.body;
    const user = req.user;
    if (!user.role === "SADMIN") {
      res.status(401).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const findPlan = await planSchema.findOne({ planId: planId });
    if (!findPlan) {
      res.status(400).json({ status: "error", message: "Plan doesn't exists" });
      return;
    }
    if (Active === true) {
      findPlan.planStatus = "ACTIVE";
      await findPlan.save();
      return res
        .status(200)
        .json({ status: "success", message: "successfully Activated Plan" });
    } else if (Active === false) {
      findPlan.planStatus = "NOT-ACTIVE";
      await findPlan.save();
      return res
        .status(200)
        .json({ status: "success", message: "successfully Deactivated Plan" });
    } else {
      return res
        .status(400)
        .json({ status: "success", message: "Select Active true or false" });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const fetchFile = async (req, res) => {
  const { path } = req.query;
  if (!path) {
    return res
      .status(400)
      .json({ status: "error", message: "Please enter path" });
  }
  const s3 = new S3({
    region: process.env.REGION,
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
  });
  const params = {
    Bucket: process.env.BUCKET,
    Key: path,
  };
  s3.getObject(params, function (err, data) {
    if (err) {
      return res.status(400).json({ err });
    } else {
      res.writeHead(200, { "Content-Type": "image/jpeg" });
      res.write(data.Body, "binary");
      res.end(null, "binary");
    }
  });
};
const updatePlan = async (req, res) => {
  try {
    const user = req.user;
    if (req.body?.planId === null || req.body?.planId === undefined) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter plan Id to proceed" });
    }
    const planIdExists = await planSchema.findOne({ planId: req.body.planId });
    if (!planIdExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Plan doesn't exist" });
    }
    let uploadFilePath;
    if (!req.file && (!req.file?.filename === null || !req.file?.filename === undefined)) {
      const logoFile = fs.readFileSync(req.file.path);
      uploadFilePath = `EB/${user._id}/planlogo/${req.body.planId}/${req.file.filename}`;
      uploadToS3Bucket(logoFile, uploadFilePath);
      fs.unink(`logoUpload/${req.file.filename}`, (err) => {
        if (err) return err;
      });
    }
    planSchema
      .findOneAndUpdate(
        { planId: req.body.planId },
        {
          planName: req.body.planName,
          planDesc: req.body.description,
          planPrice: JSON.parse(req.body.plans),
          notCovered:  JSON.parse(req.body.notCovered),
          covered:  JSON.parse(req.body.covered),
        }
      )
      .then(() => {
        res.status(200).json({
          status: "success",
          message: `Updated plan with - ID:${req.body.planId} successfully`,
        });
      });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const fetchRolesAndPermissions = async (req, res) => {
  const user = req.user;
  const rolesAndPermissions = await roleSchema.find();
  const docCount = await roleSchema.find().count();
  if (!rolesAndPermissions) {
    return res
      .status(400)
      .json({ status: "error", message: "Roles and permissions not found" });
  }
  res.status(200).json({ status: "success", rolesAndPermissions, docCount });
};
const fetchUserInfo = async (req, res) => {
  try {
    const user = req.user;
    const { userId } = req.query;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter User ID to proceed" });
    }
    const userDetails = await userSchema.findById(userId, {
      adminEmpUploadFirstSet: 0,
      token: 0,
      phoneNoVerified: 0,
      createdAt: 0,
      updatedAt: 0,
      phoneOtp: 0,
      mailOtp: 0,
      permissions: 0,
    });
    if (!userDetails) {
      return res
        .status(400)
        .json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", userDetails });
  } catch (error) { }
};
const changeUserStatus = async (req, res) => {
  try {
    const user = req.user;
    const { userId, action } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "error", message: "Provide User ID to proceed" });
    }
    if (!action) {
      return res
        .status(400)
        .json({ status: "error", message: "Please Provide action to perform" });
    }
    if (
      !action === "ACTIVATE" ||
      !action === "DEACTIVATE" ||
      !action === "DELETE"
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Action not identified" });
    }
    const findUser = await userSchema.findById(userId);
    if (!findUser) {
      return res
        .status(400)
        .json({ status: "error", message: "User doesn't exist" });
    }
    if (action === "ACTIVATE") {
      if (findUser.userStatus === "ACTIVE") {
        return res
          .status(400)
          .json({ status: "error", message: "User already active" });
      }
      findUser.userStatus = "ACTIVE";
      await findUser.save();
      res.status(200).json({
        status: "success",
        message: `Successfully set ${findUser.userName} to Active`,
      });
    }
    if (action === "DEACTIVATE") {
      if (findUser.userStatus === "INACTIVE") {
        return res
          .status(400)
          .json({ status: "error", message: "User already Inactive" });
      }
      findUser.userStatus = "INACTIVE";
      await findUser.save();
      res.status(200).json({
        status: "success",
        message: `Successfully set ${findUser.userName} to Inactive`,
      });
    }
    if (action === "DELETE") {
      if (findUser.userStatus === "PURGED") {
        return res
          .status(400)
          .json({ status: "error", message: "User not found" });
      }
      findUser.userStatus = "PURGED";
      await findUser.save();
      res.status(200).json({
        status: "success",
        message: `Successfully deleted ${findUser.userName}`,
      });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const changeOrgStatus = async (req, res) => {
  try {
    const user = req.user;
    const { orgId, action } = req.body;
    if (!orgId) {
      return res
        .status(400)
        .json({ status: "error", message: "Provide Org ID to proceed" });
    }
    if (!action) {
      return res
        .status(400)
        .json({ status: "error", message: "Please Provide action to perform" });
    }
    if (
      !action === "ACTIVATE" ||
      !action === "DEACTIVATE" ||
      !action === "DELETE"
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Action not identified" });
    }
    const findOrg = await orgSchema.findById(orgId);
    if (!findOrg) {
      return res
        .status(400)
        .json({ status: "error", message: "Org doesn't exist" });
    }
    if (action === "ACTIVATE") {
      if (findOrg.regStatus === "ACTIVE") {
        return res
          .status(400)
          .json({ status: "error", message: "Org already active" });
      }
      findOrg.regStatus = "ACTIVE";
      await findOrg.save();
      res.status(200).json({
        status: "success",
        message: `Successfully set ${findOrg.orgName} to Active`,
      });
    }
    if (action === "DEACTIVATE") {
      if (findOrg.regStatus === "NON-ACTIVE") {
        return res
          .status(400)
          .json({ status: "error", message: "Org already Inactive" });
      }
      findOrg.regStatus = "NON-ACTIVE";
      await findOrg.save();
      res.status(200).json({
        status: "success",
        message: `Successfully set ${findOrg.orgName} to Inactive`,
      });
    }
    if (action === "DELETE") {
      if (findOrg.regStatus === "PURGED") {
        return res
          .status(400)
          .json({ status: "error", message: "User not found" });
      }
      findOrg.regStatus = "PURGED";
      await findOrg.save();
      res.status(200).json({
        status: "success",
        message: `Successfully deleted ${findOrg.orgName}`,
      });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const fetchSuperAdminDetails = async (req, res) => {
  const user = req.user
  if (!user.superAdminUniversalAccess) {
    return res.status(401).json({ status: "error", message: "Unauthorized" })
  }
  // const fetchSuperAdmins  = await userSchema.aggregate({$and:[{role:"SADMIN"},{superAdminUniversalAccess:false}]})
  const planDetails = await userSchema.aggregate([
    { $match: { $and: [{ role: "SADMIN" }, { superAdminUniversalAccess: false }] } },
    {
      $lookup: {
        from: "orgs",
        localField: "_id",
        foreignField: "superAdminId",
        as: "orgsData",
      },
    }
  ]);
  res.status(200).json({ status: "success", superAdmin: planDetails })
}
const setSuperAdminStatus = async (req, res) => {
  const user = req.user
  if (!user.superAdminUniversalAccess) {
    return res.status(401).json({ status: "error", message: "Unauthorized" })
  }
  const { userId, status } = req.body
  if (!userId) {
    return res.status(400).json({ status: "error", message: "Provide User Id" })
  }
  if (!status) {
    return res.status(400).json({ status: "error", message: "Provide status" })
  }
  if (!status === 'ACTIVE' || !status === 'INACTIVE' || !status === 'PURGED') {
    return res.status(400).json({ status: "error", message: "Invalid status" })
  }
  const fetchUser = await userSchema.findById(userId)
  if (!fetchUser) {
    return res.status(400).json({ status: "error", message: "User not found" })
  }
  fetchUser.userStatus = status
  await fetchUser.save()
  res.status(200).json({ status: "success", message: "Updated user successfully" })
}
const fetchSuperAdminOrgs = async (req, res) => {
  const user = req.user
  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ status: "error", message: "Enter Org Id" })
  }
  if (!user.superAdminUniversalAccess) {
    return res.status(401).json({ status: "error", message: "Unauthorized" })
  }
  const fetchOrgs = await orgSchema.find({ superAdminId: userId })
  if (!fetchOrgs) {
    return res.status(401).json({ status: "error", message: "No orgs found" })
  }
  res.status(200).json({ status: "success", orgsDetails: fetchOrgs })
}
module.exports = {
  allOrgDetails,
  getInvoiceDetails,
  orgEmpDetails,
  userDetails,
  adminRegForm,
  sadminFetchPlan,
  addNewPlan,
  fetchOrgsWithPlan,
  setPlan,
  fetchFile,
  updatePlan,
  fetchUserInfo,
  changeUserStatus,
  changeOrgStatus,
  fetchRolesAndPermissions, fetchSuperAdminDetails, setSuperAdminStatus, fetchSuperAdminOrgs
};
