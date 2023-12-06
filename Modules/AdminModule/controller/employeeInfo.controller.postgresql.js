const exceltojson = require("convert-excel-to-json");
const sdk = require("api")("@cashfreedocs-new/v3#173cym2vlivg07d0");
const fs = require("fs-extra");
const {
  orderPay: orderSchema,
  userSchema,
  orgs: orgSchema,
  planSchema,
  setting: config,
  orgs,
  planDetailSchema,
  planPriceTable,
  wallet,
  walletTransaction,
  orderPay,
} = require("../../../PostgresModels");
const S3 = require("aws-sdk/clients/s3");
const multer = require("multer");
const historyTrail = require("../../../PostgresModels/historyTrail");
const { Op } = require("sequelize");
const { default: ShortUniqueId } = require("short-unique-id");
require("dotenv").config();

const empUpload = async (req, res) => {
  try {
    if (req.file?.filename === null || req.file?.filename === "undefined") {
      res.status(400).json({ status: "error", message: "file doesnt exist" });
      return;
    } else {
      const s3 = new S3({
        region: process.env.REGION,
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY,
      });
      let upload = multer({
        limits: 1024 * 1024 * 12,
        fileFilter: function (req, file, done) {
          if (
            file.mimetype === "image/jpg" ||
            file.mimetype === "image/jpeg" ||
            file.mimetype === "image/png" ||
            file.mimetype === "application/pdf" ||
            file.mimetype === "application/doc" ||
            file.mimetype === "application/xls" ||
            file.mimetype === "application/word" ||
            file.mimetype === "application/zip" ||
            file.mimetype === "image/bmp"
          ) {
            done(null, true);
          } else {
            done("error: please upload files with proper extensions", false);
          }
        },
      });
      const configData = await config.findAll();
      const uploadPath = configData[0].dataValues.excelTojsonfilePath;
      console.log(uploadPath);
      var filepath = uploadPath + req.file.filename;
      const {
        pageNo = 1,
        limit = 10,
        name = "",
        status = "ACTIVE",
        employeeNo = "",
      } = req.query;
      const skip = (pageNo - 1) * limit;
      const jsonData = exceltojson({
        sourceFile: filepath,
        header: { rows: 1 },
        columnToKey: { "*": "{{columnHeader}}" },
      });
      await fs.remove(filepath);
      const fetchExistingUserData = await userSchema.findAll();
      const user = req.user;
      console.log(user,"shdvsjdnskdnsdnsd sksnskc scnsknsosnssonskn");
      if (user.role !== "ADMIN") {
        res.status(400).json({ status: "error", message: "Unauthorized" });
      }
      let orgID = user.orgId;
      if (!orgID) {
        res
          .status(400)
          .json({ status: "error", message: "Organization not Found" });
        return;
      }
      const { dataValues: org } = await orgSchema.findOne({
        where: { id: orgID },
      });
      const { dataValues: plan } = await planSchema.findOne({
        where: { planStatus: "ACTIVE" },
      });
      if (!plan) {
        return res.status(400).json({
          status: "error",
          message: "Can't add users:no plan is active",
        });
      }
      const calculateAge = (birthday) => {
        const ageDifMs = Date.now() - new Date(birthday).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      }
      const planDetails = await planPriceTable.findAll({ where: { planSchemaId: user.planId } });
      // console.log(planDetails.dataValues, "PLANNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNK");
      const checkAgeAccAgeBand = (age) => {

      }
      const totalDoc = await userSchema.count({
        where: {
          orgId: user.orgId,
        },
      });
      const totalEmp = org.totalEmployee;
      let empArr = Object.values(jsonData);
      let empDataArr = empArr[0];
      let count = 0;
      let successDataArr = [];
      let missingDataArr = [];
      let emp = [];
      let error = {
        phoneNumberMissing: "Phone number is missing",
        userMailMissing: "User E-mail is missing",
        userNameMissing: "Name is missing",
        phoneNumberExist: "Phone Number is already taken",
        userMailExist: "E-mail is already taken",
        phoneNumberNotValid: "Phone Number is not Valid",
        dobMissing: "Date of Birth is missing",
        empIdMissing: "Employee ID missing",
        exceedsLimit: `Can only add ${totalEmp} employees`,
      };
      let phoneRegex = new RegExp(/^[$5-9]\d{0,9}$/);
      let mailRegex = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+/);
      for (let i = 0; i < empDataArr.length; i++) {
        let filterErrorArr = [];
        let userName = empDataArr[i].Name;
        let orgId = user.orgId;
        let planId = plan.id;
        let superAdminId = user.superAdminId;
        let userphoneNumber = empDataArr[i].ContactNo;
        let userMail = empDataArr[i].Email;
        let dob = empDataArr[i].dob;
        let empId = empDataArr[i].empId;
        let age = calculateAge(empDataArr[i].dob)
        let empData = {
          userName,
          userphoneNumber,
          userMail,
          orgId,
          superAdminId,
          planId,
          dob,
          empId,
        };
        let existingPhoneNumber = fetchExistingUserData.find(
          ({ dataValues: { userphoneNumber } }) =>
            userphoneNumber === empDataArr[i].ContactNo
        );
        let existingMail = fetchExistingUserData.find(
          ({ dataValues: { userMail } }) => userMail === empDataArr[i].Email
        );
        if (!userName || !userphoneNumber || !userMail || !empId || !dob) {
          if (!userName) {
            filterErrorArr.push(error.userNameMissing);
          }
          if (!empId) {
            filterErrorArr.push(error.empIdMissing)
          }
          if (!dob) {
            filterErrorArr.push(error.dobMissing)
          }
          if (!userphoneNumber) {
            filterErrorArr.push(error.phoneNumberMissing);
          }
          if (!userMail) {
            filterErrorArr.push(error.userMailMissing);
          }
          emp.push({
            Details: empData,
            status: "Failed",
            summary: filterErrorArr,
          });
          missingDataArr.push(empData);
          continue;
        }
        if (userName && userphoneNumber && userMail && empId && dob) {
          if (existingPhoneNumber || existingMail) {
            if (existingMail) {
              filterErrorArr.push(error.userMailExist);
            }
            if (existingPhoneNumber) {
              filterErrorArr.push(error.phoneNumberExist);
            }
            emp.push({
              Details: empData,
              status: "Failed",
              summary: filterErrorArr,
            });
            missingDataArr.push(empData);
            continue;
          }
          if (
            !String(userphoneNumber).match(phoneRegex) ||
            !String(userMail).match(mailRegex)
          ) {
            if (!String(userphoneNumber).match(phoneRegex)) {
              filterErrorArr.push(error.phoneNumberNotValid);
            }
            if (!String(userMail).match(mailRegex)) {
              filterErrorArr.push(error.userMailNotValid);
            }
            if (dob)
              emp.push({
                Details: empData,
                status: "Failed",
                summary: filterErrorArr,
              });
            missingDataArr.push(empData);
            continue;
          }
          if (count > totalEmp - totalDoc) {
            filterErrorArr.push(error.exceedsLimit);
            emp.push({
              Details: empData,
              status: "Failed",
              summary: filterErrorArr,
            });
            missingDataArr.push(empData);
            continue;
          } else {
            count = count + 1;
            emp.push({ Details: empData, status: "Success" });
            successDataArr.push(empData);
          }
        }
      }
      const empUploadData = successDataArr.map((empDataArr) => {
        return { ...empDataArr };
      });
      await userSchema.bulkCreate(empUploadData);
      await userSchema.update(
        { adminEmpUploadFirstSet: true },
        { where: { id: user.id } }
      );
      let empCount = count+org.userUploaded
      await orgSchema.update(
        { empUploadFirstSet: true, userUploaded: empCount },
        { where: { id: org.id } }
      );

      res.status(200).json({ status: "success", userData: emp });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const viewTransaction = async (req, res) => {
  try {
    const user = req.user;
    const { sort = "COMPLETE" } = req.query;
    let order;
    if (sort === "All") {
      order = await orderSchema.findAll({ where: { userId: user.id } });
    } else {
      order = await orderSchema.findAll({
        where: { [Op.and]: [{ userId: user.id }, { orderStatus: sort }] },
      });
    }
    if (!order) {
      return res
        .status(400)
        .json({ status: "error", message: "No Transaction found" });
    }
    const org = await orgSchema.findOne({ where: { id: user.orgId } });
    if (!org) {
      return res
        .status(400)
        .json({ status: "error", message: "Org not found" });
    }
    if (!org.dataValues.planType) {
      return res
        .status(400)
        .json({ status: "error", message: "Org plan not found" });
    }
    order[0].period = org.dataValues.planType;
    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const adminEmpStatus = async (req, res) => {
  try {
    const user = req.user;
    const empData = await userSchema.findAll({ where: { orgId: user.orgId } });
    if (!empData) {
      return res
        .status(400)
        .json({ status: "error", message: "Not associated with any org" });
    }
    const { dataValues: org } = await orgSchema.findOne({
      where: { id: user.orgId },
    });
    const empCount = org.totalEmployee;
    const totalEmpActive = await userSchema.count({
      where: {
        [Op.and]: [
          { orgId: org.id },
          { userStatus: { [Op.eq]: "ACTIVE" } },
          { role: { [Op.ne]: "ADMIN" } },
        ],
      },
    });

    const totalEmpNotActive = await userSchema.count({
      [Op.and]: [
        { orgId: org.id },
        { userStatus: { [Op.eq]: "PURGED" } },
        { role: { [Op.ne]: "ADMIN" } },
      ],
    });
    const transactionId = await orderSchema.findAll({
      where: { userId: user.id },
      order: [["createdAt", "DESC"]],
      limit: 1,
    });

    const percentActive = Math.round((totalEmpActive / empCount) * 100);
    res.status(200).json({
      status: "success",
      data: {
        TotalActivated: empCount,
        TotalOnboarded: totalEmpActive,
        TotalDeactivated: totalEmpNotActive,
        latestTransactionId: transactionId,
        DeactivationPending: totalEmpNotActive,
        percentActive: 8,
      },
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const addNewEmployee = async (req, res) => {
  try {
    const user = req.user;
    const { employeeNo, plan, planType, reqType, tnxId } = req.body;
    if (!employeeNo) {
      res.status(400).json({
        status: "error",
        message: "no of employee required",
      });
      return;
    }
    if (!plan) {
      res.status(400).json({
        status: "error",
        message: "employee age count required",
      });
      return;
    }
    if (!planType) {
      res.status(400).json({
        status: "error",
        message: "plan type required",
      });
      return;
    }
    if (!reqType) {
      res.status(400).json({
        status: "error",
        message: "req Type  required",
      });
      return;
    }
    const orgDetails = await orgs.findByPk(user.orgId);

    if (!orgDetails) {
      res.status(400).json({
        status: "error",
        message: "org details not found",
      });
      return;
    }
    const planDetails = await planSchema.findOne({
      where: {
        id: orgDetails.dataValues.planId,
      },
      include: [{ as: "price", model: planPriceTable }],
    });
    console.log(planDetails);
    const ageCount = { ...orgDetails.dataValues.empAgeCount };
    const planPrice = planDetails.price;

    let totalAmount = 0;
    let count = 0;
    for (i = 0; i < Object.keys(plan).length; i++) {
      const key = Object.keys(plan)[i];
      count = count + Number(plan[key]);
      console.log(planPrice, key);
      totalAmount =
        totalAmount +
        plan[key] * planPrice.find((items) => items.ageBand === key)[planType];
      console.log(Number(ageCount[key]), "Number(ageCount[key])");
      console.log(Number(Number(plan[key])), "Number(plan[key])");
      ageCount[key] = ageCount[key]
        ? Number(ageCount[key]) + Number(plan[key])
        : 0 + Number(plan[key]);
    }
    const gst = Number((totalAmount * 0.18).toFixed(0));
    const amountWithGst = gst + totalAmount;
    if (reqType === "payment") {
      const walletData = await wallet.findOne({
        where: {
          userId: user.id,
        },
      });
      if (!walletData) {
        res
          .status(400)
          .json({ status: "error", message: "somthing went wrong" });
        return;
      }
      console.log(walletData, ">>>>>>>>>>>>>>>>");
      const invoice = await orderPay.count();
      const iNo = `${0o000}` + Number(invoice) + 1;
      const invoiceNumber = user.orgId + "_" + Date.now();
      const uid = new ShortUniqueId({ length: 10 });
      const uuid = uid();
      const uniqueId = user.id + "_" + uuid + "_" + Date.now();
      if (walletData.dataValues.amount >= amountWithGst) {
        walletData.amount = walletData.dataValues.amount - amountWithGst;
        await walletTransaction.create({
          userId: user.id,
          orderAmount: amountWithGst,
          orderId: uniqueId,
          planId: orgDetails.dataValues.planId,
          tnxType: "PAID",
          status: "SUCCESS",
        });
        const updatedEmpCount =
          Number(employeeNo) + Number(orgDetails.dataValues.totalEmployee);
        console.log(
          updatedEmpCount ===
          count + Number(orgDetails.dataValues.totalEmployee)
        );
        if (
          updatedEmpCount ===
          count + Number(orgDetails.dataValues.totalEmployee)
        ) {
          // await orgDetails.update(
          //   { totalEmployee: updatedEmpCount, empAgeCount: ageCount },
          //   { where: { id: user.orgId } }
          // );
          orgDetails.totalEmployee = updatedEmpCount;
          orgDetails.empAgeCount = ageCount;
          console.log(ageCount, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
          await orgDetails.save();
          await walletData.save();
          res.status(200).json({
            status: "success",
            message: "employee range uapdated",
          });
          return;
        } else {
          res.status(400).json({
            status: "error",
            message: "total employee and age count do not match ",
          });
          return;
        }
      }
      // console.log();
      if (walletData.dataValues.amount < amountWithGst) {
        const leftAmount = amountWithGst - walletData.dataValues.amount;

        return await sdk
          .createPaymentLink(
            {
              customer_details: {
                customer_phone: user.userphoneNumber,
                customer_email: user.userMail,
                customer_name: user.userName,
              },
              link_notify: { send_sms: true, send_email: true },
              link_meta: {
                notify_url:
                  "https://ee08e626ecd88c61c85f5c69c0418cb5.m.pipedream.net",
                return_url: `http://localhost:5173/wallet-success/${uniqueId}&paymentType=newEmp`,
              },
              link_id: uniqueId,
              link_amount: leftAmount,
              link_currency: "INR",
              link_purpose: "EB INSURANCE",
              link_partial_payments: false,
              link_created_at: new Date(Date.now()).toString().slice(0, 15),
            },
            {
              "x-client-id": "TEST37145524171bbd3d6eebbeac1b554173",
              "x-client-secret": "TEST1a4794976ca903fb0daf9c4a18ee1d8f8d76b8da",
              "x-api-version": "2022-09-01",
            }
          )
          .then(async ({ data }) => {
            await orderPay.create({
              userId: user.id,
              orderId: uniqueId,
              orgId: user.orgId,
              orderPrice: amountWithGst,
              orderStatus: "PENDING",
              invoiceNumber: invoiceNumber,
              invoiceNo: iNo,
            });
            await walletTransaction.bulkCreate([
              {
                userId: user.id,
                orderAmount: amountWithGst,
                orderId: uniqueId,
                planId: null,
                tnxType: "PAID",
                status: "PENDING",
              },
              {
                userId: user.id,
                orderAmount: amountWithGst,
                orderId: uniqueId,
                planId: null,
                tnxType: "ADD",
                status: "PENDING",
              },
            ]);
            return res.status(200).json({ status: "success", data, user });
          });
      }
    }
    if (reqType === "update") {
      if (!tnxId) {
        if (!tnxId) {
          res.status(400).json({
            status: "error",
            message: "tnx Id required",
          });
          return;
        }
      }
      const orderData = await orderPay.findOne({
        where: { orderId: tnxId, orderStatus: "PENDING" },
      });
      if (!orderData) {
        res.status(400).json({
          status: "error",
          message: "order Not found",
        });
        return;
      }
      orderData.orderStatus = "SUCCESS";
      await wallet.update({ amount: 0 }, { where: { userId: user.id } });
      await orderData.save();
      await walletTransaction.update(
        { status: "SUCCESS" },
        {
          where: {
            orderId: tnxId,
            status: "PENDING",
          },
        }
      );
      const updatedEmpCount =
        Number(employeeNo) + Number(orgDetails.dataValues.totalEmployee);
      console.log(
        updatedEmpCount === count + Number(orgDetails.dataValues.totalEmployee)
      );
      if (
        updatedEmpCount ===
        count + Number(orgDetails.dataValues.totalEmployee)
      ) {
        // await orgDetails.update(
        //   { totalEmployee: updatedEmpCount, empAgeCount: ageCount },
        //   { where: { id: user.orgId } }
        // );
        orgDetails.totalEmployee = updatedEmpCount;
        orgDetails.empAgeCount = ageCount;
        console.log(ageCount, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");

        await orgDetails.save();
        // res.status(200).json({
        //   status: "success",
        //   message: "employee range uapdated",
        // });
        // return;
        res.status(200).json({
          status: { totalAmount, planPrice, count, amountWithGst },
          message: "employee range uapdated",
        });
        return;
      } else {
        res.status(400).json({
          status: "error",
          message: "total employee and age count do not match ",
        });
        return;
      }
    }
    res.status(400).json({ status: "error", message: "somthing went wrong" });
  } catch (error) {
    console.log(error, ">>>>>>>>>>>>>>>>>>>>>>>");
    res.status(400).json({ status: "error", message: error.message });
  }
};
const addEmpViaForm = async (req, res) => {
  try {
    const user = req.user;
    if (!(user.role == 'ADMIN')) {
      return res.status(401).json({ status: "error", message: "Unauthorized" })
    }
    if (!(user.userJourneyStatus === "DONE")) {
      return res.status(401).json({ status: "error", message: "Unauthorized" })
    }
    let { userInfo } = req.body
    if (userInfo.length > 6) {
      return res.status(400).json({ status: "error", message: "Can add only 6 employees" })
    }
    const org = await orgSchema.findOne({where:{id:user.orgId}})
    let userPending = org.dataValues.totalEmployee - org.dataValues.userUploaded
    // console.log(userPending,"KSKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK");
    // console.log(userInfo.length,"ARAT LSDSKND L>?<>>>>>>>>>>>>>>>>>>>>>>>>>");
    if(userInfo.length>userPending){
      return res.status(400).json({ status: "error", message: "Can't add employees please buy plan to add new employees" })
    }
    const data = []
    for (let i = 0; i <= userInfo.length; i++) {
      const element = userInfo[i]
      console.log(element,">>>>>>>>>>>>>>>>>>>>")
     if(element){
      let currUserData = {}
      currUserData['userName'] = element['name']
      currUserData['userphoneNumber'] = element['contactNo']
      currUserData['userMail'] = element['email']
      currUserData['empId'] = element['empId']
      currUserData['dob'] = element['dob']

      if (!element.name) {
       return res.status(400).json({ status: "error", message: "Enter User Name" })
      }
      if (!element.contactNo) {
        return res.status(400).json({ status: "error", message: "Enter User Phone Number" })
      }
      if (!element.email) {
        return res.status(400).json({ status: "error", message: "Enter User Mail" })
      }
      if (!element.empId) {
        return res.status(400).json({ status: "error", message: "Enter User Employee ID" })
      }
      if (!element.dob) {
        return res.status(400).json({ status: "error", message: "Enter User DOB" })
      }
      currUserData.orgId = user.orgId
      currUserData.planId = user.planId
      currUserData.superAdminId = user.superAdminId
      currUserData.role = "EMP"
      data.push(currUserData)
     }
      
    }
    let totaUserUploaded = Number(org.dataValues.userUploaded)+Number(userInfo.length)
    await orgSchema.update({userUploaded:totaUserUploaded},{where:{id:user.orgId}});
    // console.log(data, "DTAA ");
    await userSchema.bulkCreate(data)
    res.status(200).json({ status: "success", message: `Successfully added Employees` })
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
}
module.exports = {
  empUpload,
  viewTransaction,
  adminEmpStatus,
  addNewEmployee,
  addEmpViaForm
};
