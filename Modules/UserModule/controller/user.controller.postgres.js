const {
  userSchema,
  planSchema,
  orgs: orgSchema,
  orderPay: orderPayment,
  nomineeSchema: Nominee,
  pin: pinSchema,
  planPriceTable,
  coveredSchema,
  notCoveredSchema,
  family: userFamilySchema
} = require("../../../PostgresModels");
const { uploadToS3Bucket } = require("../../../utils/s3Config");
const fs = require("fs");
const html_to_pdf = require("html-pdf-node");
const { invoiceHtml } = require("../../../Template/InvoiceTemplate");
const { log } = require("winston");
const { Op } = require("sequelize");
const { sequelize } = require("../../../connection");
const planPriceCountData = {
  monthlyPrice: 1,
  quarterlyPrice: 4,
  halfYearlyPrice: 6,
  annuallyPrice: 12,
};
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
    const userData = await userSchema.findAll({
      where: {
        [Op.and]: [
          { role: { [Op.notIn]: ["SADMIN", "ADMIN"] } },
          { userName: { [Op.regexp]: regx } },
        ],
        limit: limit,
        offset: skip,
      },
    });
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
      dateFrom,
      dateTo,
      status = null,
      sortType = 1,
    } = req.query;
    const date = new Date();

    let day = date.getDate() ;
    let month = date.getMonth() ;
    let year = date.getFullYear()+1;
    let currentDate = `${year}-${month}-${day}`;
    sortType = sortType == 1 ? "ASC" : "DESC";
    const fromDate = dateFrom == undefined || null ? dateFrom : "2001-01-01";
    const toDate = dateTo == undefined || null ? dateTo : currentDate;
    if (Number(pageNo) < 1) {
      res.status(400).json({
        status: "error",
        message: "page no should be 1 or more than 1",
      });
      return;
    }
    const skip = (Number(pageNo) < 1 ? 1 : Number(pageNo) - 1) * limit;
    let user = req.user;
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
    const regx = new RegExp(`${name}`);
    if (!status || status === undefined) {
      userData = await sequelize.query(`SELECT
      us.*, 
      ps.id AS pid,
      ps.\"planId\",
      ps.\"planName\",
      ps.\"planStatus\",
      ps.\"planDesc\",
      ps.\"planLogoPath\",
      ps.\"notCovered\",
      ps."covered",
    fd.spouse,fd.\"childOne\", fd.\"childTwo\",fd.nominee
  FROM
      users us
  LEFT JOIN
      \"planSchemas\" ps ON us.\"planId\" = ps.id
  LEFT JOIN
      familydetails fd ON us."id" = fd.\"userId\"
  WHERE
      us.role NOT IN ('ADMIN', 'SADMIN')
      AND us.\"orgId\" = ${user.orgId}
      AND us.\"createdAt\" BETWEEN  '${fromDate}'  AND '${toDate}'
  GROUP BY
      us.id, ps.id,fd.id
  ORDER BY
      us.\"userName\" ${sortType} OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY
  `);
      totalDoc = await userSchema.count({
        where: {
          [Op.and]: [
            { orgId: user.orgId },
            { role: { [Op.notIn]: ["SADMIN", "ADMIN"] } },
            { userName: { [Op.regexp]: name } },
          ],
        },
      });
    } else {
      userData =
        await sequelize.query(`SELECT
        us.*, 
        ps.id AS pid,
        ps.\"planId\",
        ps.\"planName\",
        ps.\"planStatus\",
        ps.\"planDesc\",
        ps.\"planLogoPath\",
        ps.\"notCovered\",
        ps."covered",
      fd.spouse,fd.\"childOne\", fd.\"childTwo\",fd.nominee
    FROM
        users us
    LEFT JOIN
        \"planSchemas\" ps ON us.\"planId\" = ps.id
    LEFT JOIN
        familydetails fd ON us."id" = fd.\"userId\"
    WHERE
        us.role NOT IN ('ADMIN', 'SADMIN')
        AND us.\"orgId\" = ${user.orgId} 
        AND us.\"userStatus\" = '${status}'
        AND us.\"createdAt\" BETWEEN  '${fromDate}'  AND '${toDate}'
    GROUP BY
        us.id, ps.id,fd.id
    ORDER BY
        us.\"userName\" ${sortType} OFFSET ${skip} ROWS FETCH NEXT ${limit} ROWS ONLY
    `);
      totalDoc = await userSchema.count({
        where: {
          [Op.and]: [
            { orgId: user.orgId },
            { role: { [Op.notIn]: ["SADMIN", "ADMIN"] } },
            { userName: { [Op.regexp]: name } },
          ],
        },
      });
    }
    // console.log(user.orgId, "ORGID  ORGID  ORGID  ORGID  ORGID  ORGID  ORGID  ORGID  ");
    // console.log(fromDate, "fromDate fromDate fromDate fromDate fromDate fromDate fromDate ");
    // console.log(toDate, "toDate toDatetoDate toDate toDate toDate toDate toDate toDate toDate ");
    // console.log(sortType, "sortType sortType sortType sortType sortType sortType sortType sortType ");
    // console.log(skip , "skip skip skip skip skip skip skip skip skip skip skip skip skip skip skip " ); 
    // console.log(limit , "limit limit limit limit limit limit limit limit limit limit limit "); 
    // console.log(userData,"userData userData userData userData userData userData userData userData ");
    const orgs = await orgSchema.findByPk(user.orgId);
    const userOnboarded = orgs.dataValues.userUploaded;
    const userPending = Math.abs(
      Number(orgs.dataValues.totalEmployee) - Number(userOnboarded)
    );
    const userDeactive = await userSchema.count({
      where: { [Op.and]: [{ orgId: user.orgId }, { userStatus: "INACTIVE" }] },
    });
    const userPurged = await userSchema.count({
      where: { [Op.and]: [{ orgId: user.orgId }, { userStatus: "PURGED" }] },
    });
    const orgFirstUpload = orgs.dataValues.empUploadFirstSet;
    const totalPages = Math.ceil(totalDoc / Number(limit));
    res.status(200).json({
      status: "success",
      data: {
        userData: userData[0],
        currentPage: pageNo,
        totalPages,
        totalDoc,
        limit,
        orgFirstUpload,
        userOnboarded,
        userPending,
        userDeactive,
        userPurged,
        planExpiryDate: orgs.planExpiryDate,
        planStartDate: orgs.planStartDate,
      },
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const uploadProfileImage = async (req, res) => {
  try {
    // file: {},
    // number: EmpInfo.data.data.userphoneNumber,
    // email: EmpInfo.data.data.userMail,
    // name: EmpInfo.data.data.userName,
    // gender: EmpInfo?.data?.data?.gender,
    // spouseName: familyInfo?.data?.spouse?.firstName,
    // spouseGender: familyInfo?.data?.spouse?.gender,
    // spouseDob: familyInfo?.data?.spouse?.dob,
    // childOneName: familyInfo?.data?.childOne?.firstName,
    // childOneGender: familyInfo?.data?.childOne?.gender,
    // childOneDob: familyInfo?.data?.childOne?.dob,
    // childTwoName: familyInfo?.data?.childTwo?.firstName,
    // childTwoGender: familyInfo?.data?.childTwo?.gender,
    // childTwoDob: familyInfo?.data?.childTwo?.dob,
    const { userphoneNumber, userName, userMail, gender, userId } = req.body;
    const user = req.user;
    const superAdminId = req.superAdminId;
    let path;
    let userToUpdate;
    let userID;
    path = user.userProfileImagePath;
    if (userId) {
      userToUpdate = await userSchema.findOne({ where: { id: userId } })
      if ((user.role === "SADMIN" && userToUpdate.superAdminId === user.id) ||
        (user.role === "ADMIN" && userToUpdate.adminId === user.id)) {
        userID = userId
      }
      else {
        return res.status(400).json({ status: "error", message: "User Not Found" });
      }
    }
    else if (!userId) {
      userID = user.id
    }
    if (!userphoneNumber) {
      return res.status(400).json({
        status: "error",
        message: "please enter phone number to procced ",
      });
    }
    const userExists = await userSchema.findOne({ where: { userphoneNumber: userphoneNumber } });
    const userMailExist = await userSchema.findOne({ where: { userMail: userMail } })
    if (userMailExist && userMailExist.dataValues.userMail != userMail) {
      return res
        .status(400)
        .json({ status: "error", message: "can't use this email" });
    }
    if (userExists && userExists.dataValues.userphoneNumber != userphoneNumber) {
      return res
        .status(400)
        .json({ status: "error", message: "can't use this mobile number" });
    }
    if (req.file) {
      path = `EB/${superAdminId}/${user.orgId}/${user.id}/profileImage/${req.file.filename}`;
      const readFile = fs.readFileSync(req.file.path);
      await uploadToS3Bucket(readFile, path);
      fs.unlink(`logoUpload/${req.file.filename}`, (err) => {
        if (err) {
          console.log(
            `some error occured in removing the following file ${req.file.path}`
          );
        }
      });
    }
    else {
      await userSchema.update(
        {
          userphoneNumber: userphoneNumber,
          userName: userName,
          userMail: userMail,
          userProfileImagePath: path,
          gender: gender,
        },
        { where: { id: userID } }
      );
    }
    // let spouse={};
    // let childOne={};
    // let childTwo={};
    // spouse.firstName = spouseName
    // spouse.gender = spouseGender
    // spouse.dob = spouseDob
    // childOne.firstName = childOneName
    // childOne.gender = childOneGender
    // childOne.dob = childOneDob
    // childTwo.gender = childTwoGender
    // childTwo.firstName = childTwoName
    // childTwo.dob = childTwoDob
    // await userFamilySchema.update({
    //   spouse: spouse,
    //   childOne: childOne,
    //   childTwo: childTwo,
    //   nominee: nominee,
    // }, { where: { userId: userID } });

    res.status(200).json({
      status: "success",
      message: `Updated Successfully user ${user.userName}`,
      path,
      userphoneNumber,
      userName,
      userMail,
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const downloadInvoice = async (req, res) => {
  try {
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
    // const order = await orderPayment.aggregate([
    //   { $match: { $and: [{ orderId }] } },
    //   {
    //     $lookup: {
    //       from: "orgs",
    //       localField: "orgId",
    //       foreignField: "_id",
    //       as: "orderDetails",
    //     },
    //   },
    // ]);
    const order = await orderPayment.findOne({ where: { id: user.orgId } });
    // console.log(
    //   order.dataValues,
    //   ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>???????????????????????????????????"
    // );
    const ageBand = await orgSchema.findOne({ where: { id: user.orgId } });
    // console.log(ageBand.dataValues.empAgeCount,"YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
    // console.log(order[0].orderDetails[0].empAgeCount);
    // let ageBand = order[0].orderDetails[0].empAgeCount;
    // console.log(user.plan);
    const price = await planPriceTable.findAll({
      where: { planSchemaId: user.planId },
    });
    // console.log(
    //   price[0],
    //   "PRICEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE"
    // );
    let priceArr = price.planPrice;
    // console.log(priceArr[0].ageBand);
    let arr1 = [];
    let arr2 = [];
    const priceAgeCount = price.map((el) => {
      if (
        ageBand === Object.keys(ageBand.dataValues.empAgeCount) &&
        price === Object.values(ageBand.dataValues.empAgeCount)
      ) {
        el.count = Object.values(ageBand.dataValues.empAgeCount);
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
    let file = {
      content: invoiceHtml([
        {
          ...order.dataValues,
          orderDetails: [{ ...ageBand.dataValues }],
          price,
        },
      ]),
    };
    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      console.log("PDF Buffer:-", pdfBuffer);
      res.writeHead(200, { "Content-Type": "application/pdf" });
      res.write(pdfBuffer, "binary");
      res.end(null, "binary");
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const allUserCount = async (req, res) => {
  try {
    const user = req.user;
    const org = await orgSchema.findOne({ where: { id: user.orgId } });
    if (!org || !org.dataValues.regStatus === "ACTIVE") {
      return res
        .status(400)
        .json({ status: "error", message: "Org not found" });
    }
    const userOnboarded = org.dataValues.userUploaded;
    const userPending =
      Number(org.dataValues.totalEmployee) - Number(userOnboarded);
    const userDeactive = await userSchema.count({
      where: {
        [Op.and]: [{ userStatus: "INACTIVE" }, { orgId: user.orgId }],
      },
    });
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
  const isFound = await Nominee.findOne({ where: { userId: user.id } });
  if (isFound) {
    return res
      .status(400)
      .json({ message: "Nominee already added", success: false });
  }
  Nominee.create({
    userId: user.id,
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
  await userSchema.update(
    {
      userphoneNumber: userDetails.userphoneNumber,
      userMail: userDetails.userMail,
      dob: userDetails.dob,
    },
    { where: { id: userDetails.userId } }
  );
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
  await userSchema
    .create(userDetails)
    .then(async (data) => {
      orgDetails.superAdminId = user.id;
      orgDetails.totalEmployee = 0;
      // console.log(orgDetails);
      await orgSchema.create(orgDetails);
      res.status(200).json({
        status: "success",
        message: "Successfully added new Super Admin",
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({
        status: "failed",
        message: error.message,
      });
    });
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
  try {
    const user = req.user;
    const {
      companyName,
      companyGstNumber,
      partOfSEZ,
      addressLine1,
      addressLine2,
      pincode,
    } = req.body.orgDetails;
    const userInfo = await userSchema.findOne({ where: { id: user.id } });
    if (!userInfo) {
      return res
        .status(400)
        .json({ status: "error", message: "User not found" });
    }
    const orgInfo = await orgSchema.findOne({ where: { id: user.orgId } });
    if (!orgInfo) {
      return res
        .status(400)
        .json({ status: "error", message: "Org not found" });
    }
    const stateCity = await pinSchema.findOne({ where: { pincode: pincode } });
    if (!stateCity) {
      return res.status(400).json({ status: "error", message: "Invalid Pin" });
    }
    await orgSchema.update(
      {
        orgName: companyName,
        companyGstNumber: companyGstNumber,
        partOfSEZ: partOfSEZ,
        addressLine1: addressLine1,
        addressLine2: addressLine2,
        pincode: pincode,
        city: stateCity.dataValues.districtName,
        state: stateCity.dataValues.stateName,
      },
      { where: { id: user.orgId } }
    );
    next();
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const updateDetailsUserSec = async (req, res, next) => {
  try {
    const user = req.user;
    const { totalEmpCount, userMail, userName } = req.body.yourDetails;
    const userInfo = await userSchema.findOne({ where: { id: user.id } });
    // console.log(userInfo);
    if (!userInfo) {
      return res
        .status(400)
        .json({ status: "error", message: "User not found" });
    }
    const orgInfo = await orgSchema.findOne({ where: { id: user.orgId } });
    if (!orgInfo) {
      return res
        .status(400)
        .json({ status: "error", message: "Org not found" });
    }
    await orgSchema.update(
      {
        eMail: userMail,
        totalEmployee: totalEmpCount,
      },
      { where: { id: user.orgId } }
    );

    await userSchema.update(
      {
        userName: userName,
        userMail: userMail,
      },
      { where: { id: user.id } }
    );
    next();
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const updateDetailsUserThird = async (req, res) => {
  try {
    let ageCount = {};
    let planPriceCount = {};
    let totalPrice = 0;
    let totalEmpCount = 0;
    const { planDetails, planType } = req.body;
    const activePlan = await planSchema.findOne({
      where: { planStatus: "ACTIVE" },
      include: [{ as: "price", model: planPriceTable }],
    });
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
    const org = await orgSchema.findOne({ where: { id: orgId } });
    if (!org) {
      res.status(400).json({ status: "error", message: "Org not not found" });
      return;
    }
    const activePlanPrice = activePlan.dataValues.price;
    // console.log(
    //   activePlan,
    //   ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
    // );
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
    res.status(200).json({
      data: {
        totalEmployee: totalEmpCount,
        totalPrice: totalPrice,
      },
      status: "success",
      message: "successfully added members",
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const coveredNotCovered = async (req, res) => {
  const user = req.user;
  const covered = await coveredSchema.findAll();
  const notCovered = await notCoveredSchema.findAll();

  res.status(200).json({ status: "success", covered, notCovered });
};
// const editFamilyInfo = async (req, res) => {
//   try {
//     const user = req.user
//     const { spouseName, spouseGender, spouseDob, childOneName, childOneGender,
//       childTwoGender, childOneDob, childTwoDob, childTwoName, nominee, userId } = req.body
//     let spouse = {};
//     let childOne = {};
//     let childTwo = {};
//     let userID;
//     if (userId) {
//       userToUpdate = await userSchema.findOne({ where: { id: userId } })
//       if ((user.role === "SADMIN" && userToUpdate.superAdminId === user.id) ||
//         (user.role === "ADMIN" && userToUpdate.adminId === user.id)) {
//         userID = userId
//       }
//       else {
//         return res.status(400).json({ status: "error", message: "User Not Found" });
//       }
//     }
//     else if (!userId && user.role === "EMP") {
//       userID = user.id
//     }
//     else {
//       return res.status(400).json({ status: "error", message: "User Not Found" });
//     }
//     if (!spouseName || !spouseGender || !spouseDob || !childOneName || !childOneGender || !childOneDob
//       || !childTwoGender || !childTwoDob || !childTwoName || !nominee || !userId) {
//       return res.status(400).json({ status: "error", message: "Enter Details to update" })
//     }
//     spouse.firstName = spouseName
//     spouse.gender = spouseGender
//     spouse.dob = spouseDob
//     childOne.firstName = childOneName
//     childOne.gender = childOneGender
//     childOne.dob = childOneDob
//     childTwo.gender = childTwoGender
//     childTwo.dob = childTwoDob
//     childTwo.firstName = childTwoName

//     await userFamilySchema.update(spouse, childOne, childTwo, nominee, { where: { userId: userID } }).then(result => {
//       res.status(200).json({
//         status: "success", message: "Details Updated", spouse,
//         childOne,
//         childTwo,
//       })
//     })
//   } catch (error) {
//     res.status(400).json({ status: "error", message: error.message });
//     console.log(error);
//   }
// }
const editFamilyInfo = async (req, res) => {
  try {
    const user = req.user
    const { userId, type, data, nominee } = req.body
    let userID;
    let userFamilyData;
    let userToUpdate = await userSchema.findByPk(userId)
    if (!userId) {
      userID = user.id
    }
    else if (userId) {
      if (user.role === 'SADMIN') {
        userID = userId
      }
      else if (user.role === 'ADMIN' && !(userToUpdate.dataValues.role === 'SADMIN')) {
        return res.status(401).json({ status: "error", message: "Unauthorized" })
      }
      else {
        return res.status(401).json({ status: "error", message: "Unauthorized" })
      }
    }
    if (nominee) {
      if (!(nominee === "spouse" || nominee === "childOne" || nominee === "childTwo")) {
        return res.status(400).json({ status: "error", message: "Enter correct Nominee Details to update" })
      }
    }
    if (type === 'Spouse') {
      if (!data.firstName || !data.gender || !data.dob) {
        return res.status(400).json({ status: "error", message: "Enter Spouse Details to update" })
      }
      // userFamilyData = {spouse:data}
      await userFamilySchema.update({spouse:data, nominee}, { where: { userId: userID } }).then(result => {
        return res.status(200).json({
          status: "success", message: "Details Updated", spouse:data, nominee,
        })
      })
    }
    else if (type === 'childOne') {
      if (!data.firstName || !data.gender || !data.dob) {
        return res.status(400).json({ status: "error", message: "Enter Child One Details to update" })
      }
      // userFamilyData = {spouse:data}
      await userFamilySchema.update({childOne:data, nominee}, { where: { userId: userID } }).then(result => {
        return res.status(200).json({
          status: "success", message: "Details Updated", childOne:data, nominee,
        })
      })
    }
    else if (type === 'childTwo') {
      if (!data.firstName || !data.gender || !data.gender) {
        return res.status(400).json({ status: "error", message: "Enter Child Two Details to update" })
      }
      // userFamilyData = {spouse:data}
      await userFamilySchema.update({childTwo:data, nominee}, { where: { userId: userID } }).then(result => {
        return res.status(200).json({
          status: "success", message: "Details Updated", childTwo:data, nominee,
        })
      })
    }
    else {
      return res.status(400).json({ status: "error", message: "Enter User Type to update" })
    }

    //     spouse.firstName = spouseName
    //     spouse.gender = spouseGender
    //     spouse.dob = spouseDob
    //     childOne.firstName = childOneName
    //     childOne.gender = childOneGender
    //     childOne.dob = childOneDob
    //     childTwo.gender = childTwoGender
    //     childTwo.dob = childTwoDob
    //     childTwo.firstName = childTwoName

    //     data{
    //       spouse.firstName
    // spouse.gender
    // spouse.dob
    // childOne.firstName
    // childOne.gender
    // childOne.dob
    // childTwo.gender 
    // childTwo.dob
    // childTwo.firstName
    // }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
}
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
  coveredNotCovered, editFamilyInfo
};