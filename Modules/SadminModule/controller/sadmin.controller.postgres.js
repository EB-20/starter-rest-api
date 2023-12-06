const {
  orgs: orgSchema,
  orderPay: orderModel,
  userSchema,
  planSchema,
  roleSchema,
  pin: pinSchema,
  walletTransaction,
  planPriceTable,
  orgs,
  wallet,
} = require("../../../PostgresModels");
// const orgSchema = require("../../../PostgresModels/orgs.model");
// const orderModel = require("../../PaymentModule/model/paymentPostgres.model");
// const userSchema = require("../../../PostgresModels/user.model");
// const planSchema = require("../../PlanModule/model/plan.model.postgres");
// const roleSchema = require("../../../PostgresModels/role.model");
// const pinSchema = require("../../../PostgresModels/pin.model");
const { uploadToS3Bucket } = require("../../../utils/s3Config");
const { createJwtToken } = require("../../../utils/token.utils");
const fs = require("fs");
const S3 = require("aws-sdk/clients/s3");
const { Op, literal } = require("sequelize");
const { sequelize } = require("../../../connection");
const { log } = require("util");
// const org = require("../../../model/orgs.model");
require("dotenv").config();

const allOrgDetails = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10, orgName = "", status = "ALL" } = req.query;
    skip = (pageNo - 1) * limit;
    const user = req.user;
    // const regx = new RegExp(`^${orgName}`);
    let orgInfo;
    let totalOrg;
    let totalPages;

    if (user.role !== "SADMIN") {
      res.status(400).json({ status: "error", message: "Unauthorized" });
    } else {
      totalOrg = await orgSchema.count();
      if (status === "ALL" || !status) {
        orgInfo = await orgSchema.findAll({
          where: {
            orgName: sequelize.where(sequelize.fn('LOWER', sequelize.col('orgName')), 'LIKE', '%' + orgName.toLowerCase() + '%')
          },
          limit: limit,
          offset: skip,
        });
        totalPages = Math.ceil(totalOrg / Number(limit));
      } else {
        orgInfo = await orgSchema.findAll({
          where: {
            [Op.and]: [
              { regStatus: { [Op.eq]: status } },
              { orgName: sequelize.where(sequelize.fn('LOWER', sequelize.col('orgName')), 'LIKE', '%' + orgName.toLowerCase() + '%') },
            ],
          },
          limit: limit,
          offset: skip,
        });

        total = await orgSchema.count({
          where: {
            [Op.and]: [
              { regStatus: { [Op.eq]: status } },
              { orgName: sequelize.where(sequelize.fn('LOWER', sequelize.col('orgName')), 'LIKE', '%' + orgName.toLowerCase() + '%') },
            ],
          },
        });

        totalPages = Math.ceil(total / Number(limit));
      }
      const activeOrg = await orgSchema.count({
        where: { regStatus: { [Op.eq]: "ACTIVE" } },
      });

      const notActiveOrg = await orgSchema.count({
        where: { regStatus: { [Op.eq]: "NON-ACTIVE" } },
      });

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
    console.log(error);
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
    const orderDetails = await orderModel.findAll({ where: { orgId: orgId } });
    console.log(orderDetails);

    const invoiceCount = await orderModel.count({ where: { orgId: orgId } });
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
    console.log(error);
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
        empData = await userSchema.findAll({ where: { orgId: Number(orgId) } });

        empCount = await userSchema.count({ where: { orgId: Number(orgId) } });
      } else {
        empData = await userSchema.findAll({
          where: {
            [Op.and]: [
              { orgId: Number(orgId) },
              {
                [Op.or]: [
                  { userName: { [Op.iRegexp]: searchParam } },
                  {
                    userphoneNumber: {
                      [Op.iRegexp]: searchParam,
                    },
                  },
                  { userMail: { [Op.iRegexp]: searchParam } },
                ],
              },
            ],
          },
          limit: limit,
          offset: skip,
        });

        empCount = await userSchema.count({ where: { orgId: Number(orgId) } });
      }
      const totalPages = Math.ceil(empCount / Number(limit));
      res
        .status(200)
        .json({ status: "success", empData, empCount, totalPages, limit });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
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
    const order = await orderModel.findOne({ where: { orderId: orderId } });
    if (!order) {
      return res
        .status(400)
        .json({ status: "error", message: "Order doesn't exists" });
    }
    var user = await userSchema.findOne({ where: { id: order.userId } });
    // const org = await orderModel.findOne({ where: { id: order.orgId } });
    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "User doesn't exists" });
    }
    await walletTransaction.update(
      { status: "SUCCESS" },
      { where: { orderId, status: "PENDING" } }
    );
    const token = createJwtToken({ user: user.id, role: user.role });
    user.token = token;
    await user.save();
    user = user.dataValues;
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
    console.log(error);
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
    const pinExists = await pinSchema.findOne({
      where: { pincode: orgDetails.pincode },
    });
    if (!pinExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid Pin Code" });
    }
    const adminExists = await orgSchema.findOne({
      where: {
        companyGstNumber: orgDetails.companyGstNumber,
      },
    });
    if (adminExists) {
      res.status(400).json({
        status: "error",
        message: "Company GST number already exists",
      });
      return;
    }
    const companyNameExists = await orgSchema.findOne({
      where: {
        orgName: orgDetails.orgName,
      },
    });
    if (companyNameExists) {
      res.status(400).json({
        status: "error",
        message: "Company name already exists",
      });
      return;
    }
    const userphoneNumberExists = await userSchema.findOne({
      where: {
        userphoneNumber: userDetails.userphoneNumber,
      },
    });
    if (userphoneNumberExists) {
      res.status(400).json({
        status: "error",
        message: "User mobile number already exists",
      });
      return;
    }
    const userMailExists = await userSchema.findOne({
      where: {
        userMail: userDetails.userMail,
      },
    });
    if (userMailExists) {
      res.status(400).json({
        status: "error",
        message: "User mail already exists",
      });
      return;
    }
    const activePlan = await planSchema.findOne({
      where: { planStatus: "ACTIVE" },
    });
    if (!activePlan) {
      return res.status(400).json({ status: "error", message: error.message });
    }
    userDetails.superAdminId = user.id;
    userDetails.planId = activePlan.dataValues.id;
    userDetails.phoneNoVerified = true;
    userDetails.userJourneyStatus = "STEP2";
    orgDetails.planId = activePlan.dataValues.id;
    userDetails.role = userDetails.role.toUpperCase();
    userDetails.dob = null;
    await userSchema.create(userDetails);
    await orgSchema.create(orgDetails);
    // await createNewUser.save();
    // await createNewOrg.save();
    const createdUser = await userSchema.findOne({
      where: {
        userphoneNumber: userDetails.userphoneNumber,
      },
    });
    const createdOrg = await orgSchema.findOne({
      where: {
        companyGstNumber: orgDetails.companyGstNumber,
      },
    });
    // createNewUser.orgId = createdOrg.dataValues.id;
    // createdOrg.adminId = createdUser.dataValues.id;
    await userSchema.update(
      { orgId: createdOrg.dataValues.id },
      { where: { id: createdUser.dataValues.id } }
    );
    await orgSchema.update(
      { adminId: createdUser.dataValues.id },
      { where: { id: createdOrg.dataValues.id } }
    );
    // await createNewUser.save();
    // await createdOrg.save();
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
    console.log(error);
  }
};
const sadminFetchPlan = async (req, res) => {
  try {
    const user = req.user;
    if (!user.role === "ADMIN" || !user.role === "SADMIN") {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    // const planDetails = await planSchema.findAll({
    //   where: { [Op.match]: {} },
    //   include: [{ model: userSchema }, { model: orgSchema }],
    //   attributes: [
    //     "planName",
    //     "planId",
    //     "planStatus",
    //     "planDesc",
    //     "planLogoPath",
    //     "numberorgsData",
    //     "numberuserData",
    //   ],
    //   //   {
    //   //     $lookup: {
    //   //       from: "users",
    //   //       localField: "_id",
    //   //       foreignField: "planId",
    //   //       as: "userData",
    //   //     },
    //   //   },
    //   //   {
    //   //     $lookup: {
    //   //       from: "orgs",
    //   //       localField: "_id",
    //   //       foreignField: "planId",
    //   //       as: "orgsData",
    //   //     },
    //   //   },
    //   //   {
    //   //     $project: {
    //   //       planName: 1,
    //   //       planId: 1,
    //   //       planStatus: 1,
    //   //       planDesc: 1,
    //   //       planLogoPath: 1,
    //   //       numberorgsData: { $size: "$orgsData" },
    //   //       numberuserData: { $size: "$userData" },
    //   //     },
    //   //   },
    // });
    const planDetails = await planSchema.findAll({
      include: [{ as: "price", model: planPriceTable }],
    });
    // const planCount = await planSchema.count();
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
    res.status(200).json({ status: "success", planDetails: planDetails });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const sadminFetchOrgWithPlan = async (req, res) => {
  const user = req.user;
  const { planId } = req.query;
  if (!planId) {
    return res.status(400).json({ status: "error", message: "Enter Plan ID" });
  }
  const orgData = await orgs.findAll({ where: { planId: planId } });
  if (!orgData) {
    return res
      .status(400)
      .json({ status: "error", message: "No Org assocatied with plan" });
  }
  res.status(200).json({ status: "success", orgData: orgData });
};
const addNewPlan = async (req, res) => {
  try {
    const user = req.user;
    let uploadFilePath = user.planLogoPath;
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
      where: {
        planName: req.body.planName,
      },
    });
    if (planNameExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Plan Name already exists" });
    }
    const planIdExists = await planSchema.findOne({
      where: { planId: req.body.planId },
    });
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
    console.log(req.body.plans.length, ">>>>>>>>>>>>>>>>>>>>>>>>>>");
    // res.status(200).json({
    //   status: "success",
    //   message: `Added new plan with plan ID:${req.body.planId} successfully`,
    // })
    // return
    const newPlan = await planSchema.create({
      planId: req.body.planId,
      planName: req.body.planName,
      planDesc: req.body.description,
      // planPrice: JSON.parse(req.body.plans),
      planLogoPath: uploadFilePath,
      notCovered: JSON.parse(req.body.notCovered),
      covered: JSON.parse(req.body.covered),
    });
    await planPriceTable.bulkCreate(
      JSON.parse(req.body.plans).map((items) => {
        return { ...items, planSchemaId: newPlan.dataValues?.id };
      })
    );
    // await newPlan.save();
    res.status(200).json({
      status: "success",
      message: `Added new plan with plan ID:${req.body.planId} successfully`,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const fetchOrgsWithPlan = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10, planId, orgName = "" } = req.query;
    skip = (pageNo - 1) * limit;
    const user = req.user;
    const regx = new RegExp(`^${orgName}`, "i");
    console.log(planId, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
    if (!planId) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter Plan ID to proceed" });
    }
    if (!user === "SADMIN") {
      return res.status(400).json({ status: "error", message: "Unauthorized" });
    }
    const fetchPlan = await planSchema.findAll({ where: { planId } });
    if (!fetchPlan) {
      return res
        .status(400)
        .json({ status: "error", message: "Plan doesn't exists" });
    }
    const orgDetails = await orgSchema.findAll({
      where: {
        [Op.and]: [
          { planId: fetchPlan.dataValues.id },
          { orgName: { [Op.regexp]: regx } },
          {},
        ],
      },

      attributes: [
        "orgName",
        "phoneNumber",
        "eMail",
        "companyGstNumber",
        "totalEmployee",
      ],
    });
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
    console.log(error);
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
    const findPlan = await planSchema.findOne({ where: { id: planId } });
    if (!findPlan) {
      res.status(400).json({ status: "error", message: "Plan doesn't exists" });
      return;
    }
    if (Active === true) {
      findPlan.planStatus = "ACTIVE";
      // await planSchema.update(
      //   { planStatus: "ACTIVE" },
      //   { where: { id: planId } }
      // );
      await findPlan.save();
      return res
        .status(200)
        .json({ status: "success", message: "successfully Activated Plan" });
    } else if (Active === false) {
      findPlan.planStatus = "NOT-ACTIVE";
      // await planSchema.update(
      //   { planStatus: "NOT-ACTIVE" },
      //   { where: { id: planId } }
      // );
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
    console.log(error);
  }
};
const fetchFile = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const updatePlan = async (req, res) => {
  try {
    const user = req.user;
    if (req.body?.planId === null || req.body?.planId === undefined) {
      return res
        .status(400)
        .json({ status: "error", message: "Enter plan Id to proceed" });
    }
    const planIdExists = await planSchema.findOne({
      where: { id: req.body.planId },
    });
    if (!planIdExists) {
      return res
        .status(400)
        .json({ status: "error", message: "Plan doesn't exist" });
    }
    let uploadFilePath;
    if (
      !req.file &&
      (!req.file?.filename === null || !req.file?.filename === undefined)
    ) {
      const logoFile = fs.readFileSync(req.file.path);
      uploadFilePath = `EB/${user._id}/planlogo/${req.body.planId}/${req.file.filename}`;
      uploadToS3Bucket(logoFile, uploadFilePath);
      fs.unink(`logoUpload/${req.file.filename}`, (err) => {
        if (err) return err;
      });
    }
    planSchema
      .update(
        {
          planName: req.body.planName,
          planDesc: req.body.description,
          planPrice: JSON.parse(req.body.plans),
          notCovered: JSON.parse(req.body.notCovered),
          covered: JSON.parse(req.body.covered),
        },
        { where: { id: req.body.planId } }
      )
      .then(async () => {
        const priceData = JSON.parse(req.body.plans);
        console.log(priceData, "priceData");
        for (i = 0; i <= priceData.length; i++) {
          const value = priceData[i];
          if (value) {
            const updateData = {
              monthlyPrice: value["monthlyPrice"],
              quarterlyPrice: value["quarterlyPrice"],
              halfYearlyPrice: value["halfYearlyPrice"],
              annuallyPrice: value["annuallyPrice"],
            };
            await planPriceTable
              .findOne({
                where: {
                  [Op.and]: [
                    { planSchemaId: req.body.planId },
                    { ageBand: value.ageBand },
                  ],
                }
              })
              .then(function (obj) {
                // update
                if (obj)
                  return obj.update(updateData);
                // insert
                return planPriceTable.create({
                  ...updateData, planSchemaId: req.body.planId,
                  ageBand: value.ageBand
                });
              })

            // await planPriceTable.update(updateData, {
            //   where: {
            //     [Op.and]: [
            //       { planSchemaId: req.body.planId },
            //       { ageBand: value.ageBand },
            //     ],
            //   },
            // });
          }
        }
        res.status(200).json({
          status: "success",
          message: `Updated plan with - ID:${req.body.planId} successfully`,
        });
      });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const fetchRolesAndPermissions = async (req, res) => {
  try {
    const user = req.user;
    const rolesAndPermissions = await roleSchema.findAll();
    const docCount = await roleSchema.count();
    if (!rolesAndPermissions) {
      return res
        .status(400)
        .json({ status: "error", message: "Roles and permissions not found" });
    }
    res.status(200).json({ status: "success", rolesAndPermissions, docCount });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
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
    const userDetails = await userSchema.findOne({
      where: { id: userId },
      attributes: {
        exclude: [
          "adminEmpUploadFirstSet",
          "token",
          "phoneNoVerified",
          "createdAt",
          "updatedAt",
          "phoneOtp",
          "mailOtp",
          "permissions",
        ],
      },
    });
    if (!userDetails) {
      return res
        .status(400)
        .json({ status: "error", message: "User not found" });
    }
    res.status(200).json({ status: "success", userDetails });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
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
    function getAge(dateString) {
      var today = new Date();
      var birthDate = new Date(dateString);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      return age;
  }
    const plan = await planSchema.findOne({where:{id:user.planId}})
    if(!plan){
      return res
      .status(400)
      .json({ status: "error", message: "Plan not found" });
    }
    if(plan.planStatus !='ACTIVE'){
      return res
     .status(400).json({status: "error", message: "Plan not active" });
    }
    let planDetails = await planPriceTable.findAll({ raw:true,where: { planSchemaId: user.planId } });
    if(!planDetails){
      return res
      .status(400)
      .json({ status: "error", message: "Plan details not found" });
    }
    let currentOrg = await orgSchema.findByPk(user.orgId)
    let findUser = await userSchema.findOne({ where: { id: userId } });
    let userCount = currentOrg.dataValues.userUploaded
    let agePlanAmount;
    let planType = currentOrg.dataValues.planType
    let userDob = findUser.dataValues.dob
    let userAge = getAge(userDob);
    if (!currentOrg) {
      return res
        .status(400)
        .json({ status: "error", message: "org doesn't exist" });
    }
    if (!findUser) {
      return res
        .status(400)
        .json({ status: "error", message: "User doesn't exist" });
    }
    planDetails.forEach(element => {
      let ageGrp = element.ageBand
      let ageArray = ageGrp.split("-")
      let lowerAge = parseInt(ageArray[0] , 10)
      let upperAge = parseInt(ageArray[1], 10)
      if(userAge<upperAge && userAge>=lowerAge){
        if(planType==="monthlyPrice"){
          agePlanAmount = element.monthlyPrice
        }
        if(planType==="quarterlyPrice"){
          agePlanAmount = element.quarterlyPrice
        }
        if(planType==="halfYearlyPrice"){
          agePlanAmount = element.halfYearlyPrice
        }
        if(planType==="annuallyPrice"){
          agePlanAmount = element.annuallyPrice
        }
      }
    });
    if (action === "ACTIVATE") {
      if (findUser.dataValues.userStatus === "ACTIVE") {
        return res
          .status(400)
          .json({ status: "error", message: "User already active" });
      }
      if (findUser.dataValues.userStatus === "PURGED") {
        // const userPending = Math.abs(
        //   Number(orgs.dataValues.totalEmployee) - Number(orgs.dataValues.userUploaded)
        // );
        // if(userPending <1){
        //   return res.status(400).json({status:"error",message:"Please Purchase plan to add member"})
        // }
        let currentAmt = await wallet.findOne({ where: { userId: user.id } })
        let amt = currentAmt.dataValues.amount
        if(amt<agePlanAmount){
          return res.status(400).json({status:"error",message:`Insufficient balance in wallet : Add Rs.${agePlanAmount-amt} to your wallet to activate user : ${user.userName}`})
        }
        await wallet.update({ amount: Number(amt) - Number(agePlanAmount) }, { where: { userId: user.id } })
        await orgSchema.update({
          userUploaded: Number(userCount) + 1,
          totalEmployee: Number(currentOrg.dataValues.totalEmployee) + 1,
        }, { where: { id: user.orgId } })
      }
      await userSchema.update(
        { userStatus: "ACTIVE" },
        { where: { id: findUser.dataValues.id } }
      );
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
      await userSchema.update(
        { userStatus: "INACTIVE" },
        { where: { id: findUser.dataValues.id } }
      );
      res.status(200).json({
        status: "success",
        message: `Successfully set ${findUser.userName} to Inactive`,
      });
    }
    if (action === "DELETE") {
      if (findUser.userStatus === "PURGED") {
        return res
          .status(400)
          .json({ status: "error", message: "User already purged" });
      }
      let userCount = currentOrg.dataValues.userUploaded
      let currentAmt = await wallet.findOne({ where: { userId: user.id } })
      let amt = currentAmt.dataValues.amount
      await wallet.update({ amount: Number(amt) + agePlanAmount }, { where: { userId: user.id } })
      
      await userSchema.update(
        { userStatus: "PURGED" },
        { where: { id: findUser.dataValues.id } }
      );
      await orgSchema.update({
        userUploaded: Number(userCount) - 1,
        totalEmployee: Number(currentOrg.dataValues.totalEmployee) - 1
      }, { where: { id: user.orgId } })
      res.status(200).json({
        status: "success",
        message: `Successfully deleted ${findUser.userName}`,
      });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
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
    const findOrg = await orgSchema.findByPk(orgId);
    if (!findOrg) {
      return res
        .status(400)
        .json({ status: "error", message: "Org doesn't exist" });
    }
    if (action === "ACTIVATE") {
      if (findOrg.dataValues.regStatus === "ACTIVE") {
        return res
          .status(400)
          .json({ status: "error", message: "Org already active" });
      }
      await orgSchema.update(
        { regStatus: "ACTIVE" },
        { where: { id: findOrg.dataValues.id } }
      );
      res.status(200).json({
        status: "success",
        message: `Successfully set ${findOrg.dataValues.orgName} to Active`,
      });
    }
    if (action === "DEACTIVATE") {
      if (findOrg.regStatus === "NON-ACTIVE") {
        return res
          .status(400)
          .json({ status: "error", message: "Org already Inactive" });
      }
      await orgSchema.update(
        { regStatus: "NON-ACTIVE" },
        { where: { id: findOrg.dataValues.id } }
      );
      res.status(200).json({
        status: "success",
        message: `Successfully set ${findOrg.orgName} to Non Active`,
      });
    }
    if (action === "DELETE") {
      if (findOrg.dataValues.regStatus === "PURGED") {
        return res
          .status(400)
          .json({ status: "error", message: "User not found" });
      }

      await orgSchema.update(
        { regStatus: "PURGED" },
        { where: { id: findOrg.dataValues.id } }
      );

      res.status(200).json({
        status: "success",
        message: `Successfully deleted ${findOrg.dataValues.orgName}`,
      });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const fetchSuperAdminDetails = async (req, res) => {
  try {
    const user = req.user;
    if (!user.superAdminUniversalAccess) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    // const fetchSuperAdmins  = await userSchema.aggregate({$and:[{role:"SADMIN"},{superAdminUniversalAccess:false}]})
    const planDetails = await sequelize.query(
      'select us.* as userid, ARRAY_AGG(org.*) as "orgsData" from users us left join orgs org on us."orgId"=org.id where us.role = \'SADMIN\' AND us."superAdminUniversalAccess" = \'false\' GROUP BY us.id'
    );
    res.status(200).json({ status: "success", superAdmin: planDetails[0] });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const setSuperAdminStatus = async (req, res) => {
  try {
    const user = req.user;
    if (!user.superAdminUniversalAccess) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const { userId, status } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ status: "error", message: "Provide User Id" });
    }
    if (!status) {
      return res
        .status(400)
        .json({ status: "error", message: "Provide status" });
    }
    if (
      !status === "ACTIVE" ||
      !status === "INACTIVE" ||
      !status === "PURGED"
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid status" });
    }
    const fetchUser = await userSchema.findOne({ where: { id: userId } });
    if (!fetchUser) {
      return res
        .status(400)
        .json({ status: "error", message: "User not found" });
    }
    // fetchUser.userStatus = status;
    userSchema.update({ userStatus: status }, { where: { id: userId } });
    // await fetchUser.save();
    res
      .status(200)
      .json({ status: "success", message: "Updated user successfully" });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const fetchSuperAdminOrgs = async (req, res) => {
  try {
    const user = req.user;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ status: "error", message: "Enter Org Id" });
    }
    if (!user.superAdminUniversalAccess) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }
    const fetchOrgs = await orgSchema.findAll({
      where: { superAdminId: userId },
    });
    if (!fetchOrgs) {
      return res
        .status(401)
        .json({ status: "error", message: "No orgs found" });
    }
    res.status(200).json({ status: "success", orgsDetails: fetchOrgs });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const sadminFetchUsersWithOrg = async (req, res) => {
  const user = req.user;
  const planId = req.query;
  if (!planId) {
    return res.status(400).json({ status: "error", message: "Enter PLan ID" });
  }
  const userData = await userSchema.findAll({ where: { planId: planId } });
  if (!orgData) {
    return res
      .status(400)
      .json({ status: "error", message: "No user assocatied with plan" });
  }
  res.status(200).json({ status: "success", userData: userData[0] });
};
const getPlanById = async (req, res) => {
  try {
    const { planId } = req.query;
    if (!planId) {
      return res
        .status(400)
        .json({ status: "error", message: " Plan ID required" });
    }
    const plan = await planSchema.findOne({
      where: { id: planId },
      include: [{ as: "price", model: planPriceTable }],
    });
    if (!plan) {
      return res
        .status(400)
        .json({ status: "error", message: " Plan not found" });
    }
    return res.status(200).json(plan);
  } catch (e) {
    console.log(e);
    return res
      .status(400)
      .json({ status: "error", message: "something went wrong" });
  }
};
module.exports = {
  allOrgDetails,
  getInvoiceDetails,
  orgEmpDetails,
  userDetails,
  adminRegForm,
  sadminFetchPlan,
  addNewPlan,
  getPlanById,
  fetchOrgsWithPlan,
  setPlan,
  fetchFile,
  updatePlan,
  fetchUserInfo,
  changeUserStatus,
  changeOrgStatus,
  fetchRolesAndPermissions,
  fetchSuperAdminDetails,
  setSuperAdminStatus,
  fetchSuperAdminOrgs,
  sadminFetchOrgWithPlan,
  sadminFetchUsersWithOrg,
};
