const { ISO_8601 } = require("moment");
const userSchema = require("../../../model/user.model");
const planSchema = require("../../PlanModule/model/plan.model");
const orgSchema = require("../../../model/orgs.model");
const orderSchema = require("../../../model/orgs.model");
const { uploadToS3Bucket } = require("../../../utils/s3Config");
const fs = require("fs");
const html_to_pdf = require("html-pdf-node");
const { invoiceHtml } = require("../../../Template/InvoiceTemplate");
const orderPayment = require("../../PaymentModule/model/payment.model");
const plan = require("../../PlanModule/model/plan.model");
const S3 = require("aws-sdk/clients/s3");
const Nominee = require("../../../model/nominee.model");
const Family = require("../../../model/userFamilyDetails.model");
const { log } = require("winston");
const pinSchema = require("../../../model/pin.model");
const planDetailsSchema = require("../../PlanModule/model/planDetails.model");

const userMyaccount = async (req, res) => {
  try {
    const user = req.user;
    const userMail = user.userMail;
    if (!userMail) {
      res
        .status(400)
        .json({ status: "error", message: "user email is not registered" });
      return;
    }
    const userphoneNumber = user.userphoneNumber;
    if (!userphoneNumber) {
      res.status(400).json({
        status: "error",
        message: "user phone number is not verified",
      });
      return;
    }
    const userName = user.userName;
    if (!userName) {
      res
        .status(400)
        .json({ status: "error", message: "user name doesn't exists" });
      return;
    }
    const regx = new RegExp(`^${name}`, "i");
    const userData = await userSchema
      .find({
        $and: [
          { role: { $nin: ["SADMIN", "ADMIN"] } },
          { userName: { $regex: regx } },
        ],
      })
      .limit(limit)
      .skip(skip);
    res.status(200).json({
      status: "success",
      data: {
        userData: userData,
      },
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const userData = async (req, res) => {
  try {
    let {
      pageNo = 1,
      limit = 5,
      name = "",
      dateFrom = -8640000000000000,
      dateTo = new Date().getTime(),
      status = null,
      sortType = 1,
    } = req.query;
    const fromDate = dateFrom == "undefined" ? -8640000000000000 : dateFrom;
    const toDate = dateTo == "undefined" ? new Date().getTime() : dateTo;
    if (Number(pageNo) < 1) {
      res.status(400).json({
        status: "error",
        message: "page no should be 1 or more than 1",
      });
      return;
    }
    const skip = (Number(pageNo) < 1 ? 1 : Number(pageNo) - 1) * limit;
    const user = req.user;
    let userData;
    let totalDoc;
    if (!user.role) {
      res
        .status(400)
        .json({ status: "error", message: "Can't find role for user" });
      return;
    }
    if (user.role !== "ADMIN" && user.role !== "SADMIN") {
      res.status(400).json({ status: "error", message: "Unauthorized" });
      return;
    }
    const userMail = user.userMail;
    if (!userMail) {
      res
        .status(400)
        .json({ status: "error", message: "user email is not registered" });
      return;
    }
    const userphoneNumber = user.userphoneNumber;
    if (!userphoneNumber) {
      res.status(400).json({
        status: "error",
        message: "user phone number is not verified",
      });
      return;
    }
    const userName = user.userName;
    if (!userName) {
      res
        .status(400)
        .json({ status: "error", message: "user name doesn't exists" });
      return;
    }
    const regx = new RegExp(`^${name}`, "i");
    if (!status) {
      userData = await userSchema.aggregate([
        {
          $match: {
            $and: [
              { orgId: user.orgId },
              { role: { $nin: ["SADMIN", "ADMIN"] } },
              { userName: { $regex: regx } },
              {
                createdAt: {
                  $gte: new Date(Number(fromDate)),
                  $lt: new Date(Number(toDate)),
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "planschemas",
            localField: "planId",
            foreignField: "_id",
            as: "planData",
          },
        },
        {
          $lookup: {
            from: "familydetails",
            localField: "_id",
            foreignField: "userId",
            as: "familyInfo",
          },
        },
        {
          $sort: {
            createdAt: Number(sortType),
          },
        },
        {
          $skip: Number(skip),
        },
        {
          $limit: Number(limit),
        },
        {
          $project: {
            "planData.planName": 1,
            familyInfo: 1,
            orgId: 1,
            superAdminId: 1,
            planId: 1,
            userName: 1,
            relationStatus: 1,
            userphoneNumber: 1,
            role: 1,
            permissions: 1,
            userMail: 1,
            userProfileImagePath: 1,
            userStatus: 1,
            createdAt: 1,
            updatedAt: 1,
            spouse: 1,
            childOne: 1,
            childTwo: 1,
          },
        },
      ]);
      totalDoc = await userSchema
        .find({
          $and: [
            { orgId: user.orgId },
            { role: { $nin: ["SADMIN", "ADMIN"] } },
            { userName: { $regex: regx } },
            {
              createdAt: {
                $gte: new Date(Number(fromDate)),
                $lt: new Date(Number(toDate)),
              },
            },
          ],
        })
        .count();
    } else {
      userData = await userSchema.aggregate([
        {
          $match: {
            $and: [
              { orgId: user.orgId },
              { role: { $nin: ["SADMIN", "ADMIN"] } },
              { userName: { $regex: regx } },
              { userStatus: status },
              {
                createdAt: {
                  $gte: new Date(Number(fromDate)),
                  $lt: new Date(Number(toDate)),
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "planschemas",
            localField: "planId",
            foreignField: "_id",
            as: "planData",
          },
        },
        {
          $lookup: {
            from: "familydetails",
            localField: "_id",
            foreignField: "userId",
            as: "familyInfo",
          },
        },
        {
          $sort: {
            createdAt: Number(sortType),
          },
        },
        {
          $skip: Number(skip),
        },
        {
          $limit: Number(limit),
        },
        {
          $project: {
            "planData.planName": 1,
            "planData.planDesc": 1,
            "planData.notCovered": 1,
            "planData.covered":1,
            familyInfo: 1,
            orgId: 1,
            superAdminId: 1,
            planId: 1,
            userName: 1,
            relationStatus: 1,
            userphoneNumber: 1,
            role: 1,
            permissions: 1,
            userMail: 1,
            userProfileImagePath: 1,
            userStatus: 1,
            createdAt: 1,
            updatedAt: 1,
            spouse: 1,
            childOne: 1,
            childTwo: 1,
          },
        },
      ]);
      totalDoc = await userSchema
        .find({
          $and: [
            { orgId: user.orgId },
            { role: { $nin: ["SADMIN", "ADMIN"] } },
            { userName: { $regex: regx } },
            { userStatus: status },
            {
              createdAt: {
                $gte: new Date(Number(fromDate)),
                $lt: new Date(Number(toDate)),
              },
            },
          ],
        })
        .count();
    }
    const orgs = await orgSchema.findById(user.orgId);
    const userOnboarded = orgs.userUploaded;
    const userPending = Math.abs(
      Number(orgs.totalEmployee) - Number(userOnboarded)
    );  
    const userDeactive = await userSchema
      .find({$and:[{ orgId: user.orgId },{ userStatus: "INACTIVE" }]})
      .count();
    const orgFirstUpload = orgs.empUploadFirstSet;
    const totalPages = Math.ceil(totalDoc / Number(limit));
    res.status(200).json({
      status: "success",
      data: {
        userData: userData,
        currentPage: pageNo,
        totalPages,
        totalDoc,
        limit,
        orgFirstUpload,
        userOnboarded,
        userPending,
        userDeactive,
        planExpiryDate: orgs.planExpiryDate,
        planStartDate: orgs.planStartDate,
      },
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const uploadProfileImage = async (req, res) => {
  const user = req.user;
  const superAdminId = req.superAdminId;
  const { userphoneNumber } = req.body;
  let path;
  path = user.userProfileImagePath;
  // if (req.body.userId === null || req.body.userId === undefined) {
  //   return res.status(400).json({ status: "error", message: "Enter User ID to proceed" });
  // }
  // console.log(user)

  if (!userphoneNumber) {
    res.status(400).json({
      status: "error",
      message: "please enter phone number to procced ",
    });
  }
  const userExists = await userSchema.findOne({ userphoneNumber });

  if (userExists && userExists.userphoneNumber != userphoneNumber) {
    return res
      .status(400)
      .json({ status: "error", message: "can't use this mobile number" });
  }
  console.log(req.file, "req.file");
  if (req.file) {
    path = `EB/${superAdminId}/${user.orgId}/${user._id}/profileImage/${req.file.filename}`;
    user.userProfileImagePath = path;
    user.save();
    const readFile = fs.readFileSync(req.file.path);
    await uploadToS3Bucket(readFile, path);
    fs.unlink(`logoUpload/${req.file.filename}`, (err) => {
      if (err) {
        console.log(
          `some error occured in removing the following file ${req.file.path}`
        );
      }
    });
    await userSchema.findByIdAndUpdate(user._id, {
      userProfileImagePath: path,
      userphoneNumber: req.body.userphoneNumber,
    });
  } else {
    await userSchema.findByIdAndUpdate(user._id, {
      userphoneNumber: req.body.userphoneNumber,
    });
  }

  res.status(200).json({
    status: "success",
    message: `Updated Successfully user ${user.userName}`,
    path,
    userphoneNumber,
  });
};
const downloadInvoice = async (req, res) => {
  let options = { format: "A4" };
  const user = req.user;
  // Example of options with args //
  // let options = { format: 'A4', args: ['--no-sandbox', '--disable-setuid-sandbox'] };
  const { orderId } = req.query;
  if (!orderId || orderId === "undefined") {
    return res
      .status(400)
      .json({ status: "error", message: "please enter order id to proceed" });
  }
  const order = await orderPayment.aggregate([
    { $match: { $and: [{ orderId }] } },
    {
      $lookup: {
        from: "orgs",
        localField: "orgId",
        foreignField: "_id",
        as: "orderDetails",
      },
    },
  ]);
  // console.log(order[0].orderDetails[0].empAgeCount);
  // let ageBand = order[0].orderDetails[0].empAgeCount;
  let ageBand = await org;
  const price = await planSchema.findById(user.planId);
  let priceArr = price.planPrice;
  // console.log(priceArr[0].ageBand);
  let arr1 = [];
  let arr2 = [];
  const priceAgeCount = priceArr.map((el) => {
    if (ageBand === Object.keys(ageBand) && price === Object.values(ageBand)) {
      el.count = Object.values(ageBand);
      console.log(el);
      arr1.push(el);
    } else {
      arr2.push(el);
    }
  });
  if (!order) {
    return res
      .status(400)
      .json({ status: "error", message: "can't find any order" });
  }
  // return res
  // .status(200)
  // .json({ order });
  // console.log(order);
  let file = { content: invoiceHtml(order) };
  html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
    console.log("PDF Buffer:-", pdfBuffer);
    res.writeHead(200, { "Content-Type": "application/pdf" });
    res.write(pdfBuffer, "binary");
    res.end(null, "binary");
  });
};
const allUserCount = async (req, res) => {
  try {
    const user = req.user;
    const org = await orderSchema.findById(user.orgId);
    if (!org || !org.regStatus === "ACTIVE") {
      return res
        .status(400)
        .json({ status: "error", message: "Org not found" });
    }
    const userOnboarded = org.userUploaded;
    const userPending = Number(org.totalEmployee) - Number(userOnboarded);
    const userDeactive = await userSchema
      .find({ userStatus: "INACTIVE" }, { orgId: user.orgId })
      .count();
    res.status(200).json({
      status: "success",
      data: {
        userOnboarded,
        userPending,
        userDeactive,
        deactivationPending: 0,
      },
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const addNominee = async (req, res) => {
  const user = req.user;
  const { name, relation, dob } = req.body;
  if (!name) {
    return res
      .status(400)
      .json({ message: "Full Name is required", success: false });
  }
  if (!relation) {
    res.status(400).json({ message: "Relation is required", success: false });
  }
  if (!dob) {
    return res
      .status(400)
      .json({ message: "Date of birth is required", success: false });
  }
  const isFound = await Nominee.find({ userId: user._id });
  if (isFound) {
    return res
      .status(400)
      .json({ message: "Nominee already added", success: false });
  }
  Nominee.create({
    userId: user._id,
    dob,
    name,
    relation,
  })
    .then(() => {
      res
        .status(200)
        .json({ message: "Nominee details added successfully", success: true });
    })
    .catch((error) => {
      res.status(400).json({ message: error.message, success: true });
    });
};
const editUserData = async (req, res) => {
  const user = req.user;
  const { userDetails } = req.body;
  if (!userDetails) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter user Details to edit" });
  }
  if (!userDetails.userId) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter user Id to proceed" });
  }
  await userSchema.findByIdAndUpdate(userDetails.userId, {
    userphoneNumber: userDetails.userphoneNumber,
    userMail: userDetails.userMail,
    dob: userDetails.dob,
  });
  res
    .status(200)
    .json({ status: "success", message: "successfully updated user" });
};
const addSuperAdmin = async (req, res) => {
  const user = req.user;
  if (!user.superAdminUniversalAccess) {
    return res
      .status(401)
      .json({ status: "error", message: "Can't create super admin" });
  }
  const { orgDetails, userDetails } = req.body;
  if (!orgDetails.orgName) {
    return res.status(400).json({ status: "error", message: "Enter Org Name" });
  }
  if (!userDetails.userName) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter User Name" });
  }
  if (!userDetails.userMail) {
    return res.status(400).json({ status: "error", message: "Enter Email" });
  }
  if (!userDetails.userphoneNumber) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter User Phone Number" });
  }
  if (!orgDetails.companyGstNumber) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter Org GST number" });
  }
  if (!userDetails.dob) {
    return res.status(400).json({ status: "error", message: "Enter User DOB" });
  }
  if (!orgDetails.addressLine1) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter address to proceed" });
  }
  if (!orgDetails.addressLine2) {
    return res
      .status(400)
      .json({ status: "error", message: "Enter complete address" });
  }
  if (!orgDetails.pincode) {
    return res.status(400).json({ status: "error", message: "Enter PIN code" });
  }
  if (!userDetails.role) {
    return res.status(400).json({ status: "error", message: "Enter role" });
  }
  userDetails.role = "SADMIN";
  await userSchema.create(userDetails).then((data) => {
    orgDetails.superAdminId = data._id;
  });
  const superAdminOrg = new orgSchema(orgDetails);
  await superAdminOrg.save();
  res
    .status(200)
    .json({ status: "success", message: "Successfully added new Super Admin" });
};
// const updateDetailsUser = async (req, res) => {
//   const user = req.user
//   const { userDetails } = req.body
//   if (!userDetails) {
//     return res.status(400).json({ status: "error", message: "Enter Details to update" })
//   }
//   const userInfo = await userSchema.findById(user._id)
//   // console.log(userInfo);
//   if (!userInfo) {
//     return res.status(400).json({ status: "error", message: "User not found" })
//   }
//   const orgInfo = await orgSchema.findById(user.orgId)
//   if (!orgInfo) {
//     return res.status(400).json({ status: "error", message: "Oeg not found" })
//   }
//   await userSchema.findById(user._id, { userphoneNumber: userphoneNumber });
//   await orgSchema.findById(user.orgId, { phoneNumber: userphoneNumber });
//   // const updatedUserData = await userSchema.findByIdAndUpdate(user._id, userDetails )
//   // const updatedOrgData = await orgSchema.findByIdAndUpdate(user.orgId,  orgDetails )
//   res.status(200).json({ status: "success" })
// }
const updateDetailsUser = async (req, res, next) => {
  const user = req.user;
  console.log(user,'>>>>>>>>>>>>>>>>>>>>>>')
  const { 
    companyName,
    companyGstNumber,
    partOfSEZ,
    addressLine1,
    addressLine2,
    pincode,
  } = req.body.orgDetails;
  const userInfo = await userSchema.findById(user._id);
  if (!userInfo) {
    return res.status(400).json({ status: "error", message: "User not found" });
  }
  const orgInfo = await orgSchema.findById(user.orgId);
  if (!orgInfo) {
    return res.status(400).json({ status: "error", message: "Org not found" });
  }
  const stateCity = await pinSchema.findOne({ pincode: pincode });
  if (!stateCity) {
    return res.status(400).json({ status: "error", message: "Invalid Pin" });
  }
  await orgSchema.findByIdAndUpdate(user.orgId, {
    orgName: companyName,
    companyGstNumber: companyGstNumber,
    partOfSEZ: partOfSEZ,
    addressLine1: addressLine1,
    addressLine2: addressLine2,
    pincode: pincode,
    city: stateCity.districtName,
    state: stateCity.stateName,
  });
  next();
};
const updateDetailsUserSec = async (req, res, next) => {
  const user = req.user;
  const { totalEmpCount, userMail, userName } = req.body.yourDetails;
  const userInfo = await userSchema.findById(user._id);
  // console.log(userInfo);
  if (!userInfo) {
    return res.status(400).json({ status: "error", message: "User not found" });
  }
  const orgInfo = await orgSchema.findById(user.orgId);
  if (!orgInfo) {
    return res.status(400).json({ status: "error", message: "Org not found" });
  }
  await orgSchema.findByIdAndUpdate(user.orgId, {
    eMail: userMail,
    totalEmployee: totalEmpCount,
  });
  await userSchema.findByIdAndUpdate(user._id, {
    userName: userName,
    userMail: userMail,
  });
  next();
};
const updateDetailsUserThird = async (req, res) => {
  let ageCount = {};
  let planPriceCount = {};
  let totalPrice = 0;
  let totalEmpCount = 0;
  const { planDetails ,planType} = req.body;
  const activePlan = await planSchema.findOne({ planStatus: "ACTIVE" });
  if (!activePlan) {
    res.status(400).json({ status: "error", message: "Plan not found" });
    return;
  }
  // const activePlanDetails = await planDetailsSchema.findOne({
  //   planId: activePlan.planId,
  // });
  // if (!activePlanDetails) {
  //   res
  //     .status(400)
  //     .json({ status: "error", message: "Plan details not found" });
  //   return;
  // }
  const user = req.user;
  const orgId = user.orgId;
  const org = await orgSchema.findById({ _id: orgId });
  if (!org) {
    res.status(400).json({ status: "error", message: "Org not not found" });
    return;
  }
  const activePlanPrice = activePlan.planPrice;
  for (let i = 0; i < planDetails.length; i++) {
    var ageBand = planDetails[i].ageBand;
    var count = planDetails[i].count;
    ageCount[ageBand] = Number(count);
    var ageCountArr = activePlanPrice.filter((price) => {
      if (price.ageBand === ageBand) {
        totalEmpCount += Number(count);
        totalPrice += count * price[planType];
        planPriceCount[ageBand] = Number(price[planType]);
      }
    });
  }
  if (totalEmpCount > org.totalEmployee) {
    res.status(400).json({
      status: "error",
      message:
        "Employees enrolled must be less than or equal to total employees",
    });
    return;
  }
  org.empAgeCount = ageCount;
  org.planId = activePlan._id;
  org.planType = planType
  org.totalPlanPrice = totalPrice * 12;
  await user.save();
  await org.save();
  res.status(200).json({
    data: {
      totalEmployee: totalEmpCount,
      totalPrice: totalPrice,
    },
    status: "success",
    message: "successfully added members",
  });
};

module.exports = {
  userMyaccount,
  userData,
  uploadProfileImage,
  downloadInvoice,
  allUserCount,
  addNominee,
  editUserData,
  addSuperAdmin,
  updateDetailsUser,
  updateDetailsUserSec,
  updateDetailsUserThird,
};
