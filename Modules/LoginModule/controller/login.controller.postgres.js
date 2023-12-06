const axios = require("axios");
const nodemailer = require("nodemailer");
const { createJwtToken } = require("../../../utils/token.utils");
const { sendOtp, sendMailOtp } = require("../../../utils/otp");
const { progressData } = require("../../../utils/progressData");
const { loginLog } = require("../../../utils/logger");
const { Op, literal } = require("sequelize");
const logger = require("../../../utils/logger");
const {
  userSchema: userModel,
  orgs: orgSchema,
  planSchema,
  userSchema,
} = require("../../../PostgresModels");


const login = async (req, res) => {
  try {
    const { userMail } = req.body;
    const { userphoneNumber } = req.body;
    if (!userMail && !userphoneNumber) {
      res.status(400).json({
        status: "error",
        message: "Please Provide user details to login",
      });
      return;
    }
    if (userMail && !userphoneNumber) {
      const userEMail = await userModel.findOne({ where: { userMail } });
      if (!userEMail) {
        res.status(400).json({
          status: "error",
          message: "Email doesn't exist please register",
        });
        return;
      }
      const mailOtp = await sendMailOtp(userEMail.dataValues.userMail);
      const updateData = {};
      updateData.mailOtp = mailOtp;
      const token = createJwtToken({ userEMail: userEMail.dataValues.id });
      updateData.token = token;
      await userModel.update(updateData, {
        where: { id: userEMail.dataValues.id },
      });
      res.status(201).json({
        status: "success",
        message: "Otp sent to Email " + `${userMail}`,
        data: {
          userId: userEMail.dataValues.id,
        },
      });
      return;
    }
    if (userphoneNumber && !userMail) {
      const phoneNumber = await userModel.findOne({
        where: {
          userphoneNumber: userphoneNumber,
        },
      });
      if (!phoneNumber) {
        res.status(400).json({
          status: "error",
          message: "Phone Number doesn't exist please register",
        });
        return;
      }
      // if (phoneNumber === "9211906242") {
      //   return res.status(200).json({
      //     status: "success",
      //     message: "OTP successfully sent to phone number",
      //   });
      // }
      if (
        phoneNumber.dataValues.role === "ADMIN" &&
        phoneNumber.dataValues.phoneNoVerified !== true
      ) {
        console.log("2");
        loginLog.log(
          `400 - Phone Number doesn't exist please register - ${req.method} - ${req.ip} - ${userphoneNumber}`
        );
        res.status(400).json({
          status: "error",
          message: "Phone Number doesn't exist please register",
        });
        return;
      }
      if (
        (phoneNumber.dataValues.role === "ADMIN" &&
          phoneNumber.dataValues.phoneNoVerified === true) ||
        phoneNumber.dataValues.role === "EMP" ||
        phoneNumber.dataValues.role === "SADMIN"
      ) {
        var otp = await sendOtp(userphoneNumber);
        userModel
          .update(
            { phoneOtp: otp },
            { where: { id: phoneNumber.dataValues.id } }
          )
          .then(() => {
            res
              .status(200)
              .json({ status: "success", message: "Otp sent to Phone number" });
          });
      }
      // console.log(phoneNumber);
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const verifyLogin = async (req, res) => {
  try {
    const { userphoneNumber, userMail, otp } = req.body;
   
    if (!(userMail || userphoneNumber)) {
      // logger.error("Please Provide user details to login")
      // logger.error(`${err.status || 400} - ${res.statusMessage} - ${err.message} - ${req.method} - ${req.ip} - ${userphoneNumber} - ${userMail}`);
      res.status(400).json({
        status: "error",
        message: "Please Provide user details to login",
      });
      return;
    }
    if (!otp) {
      res
        .status(400)
        .json({ status: "error", message: "Enter Otp to proceed" });
      // loginLog.log("error", "Fail", {
      //   loginType: !userphoneNumber ? "Email" : "Mobile",
      //   loginKey: !userphoneNumber ? userMail : userphoneNumber,
      //   loginTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
      //   remark: "Enter Otp to proceed",
      //   ipAddress: req.ip,
      // });
      return;
    }
  
    if (!userMail && otp && userphoneNumber) {
  
      const user = await userModel.findOne({
        where: {
          userphoneNumber: userphoneNumber,
        },
      });
      if (!user) {
        res.status(400).json({
          status: "error",
          message: "user not exist",
        });
        return;
      }
      let plan;
      if (user.dataValues.role === "SADMIN") {
        plan = { planName: "ALL" };
      } else {
        plan = await planSchema.findOne({
          where: { id: user.dataValues.planId },
        });
        if (!plan) {
          return res
            .status(400)
            .json({ status: "error", message: "Plan not found" });
        }
      }
      if (!user) {
        res.status(400).json({
          status: "error",
          message: "User not registered please signup",
        });
        // loginLog.log("error", "Fail", {
        //   loginType: !userphoneNumber ? "Email" : "Mobile",
        //   loginKey: !userphoneNumber ? userMail : userphoneNumber,
        //   loginTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
        //   remark: "User not registered please signup",
        //   ipAddress: req.ip,
        // });
        return;
      }
      if (user.dataValues.phoneOtp !== otp) {
        res
          .status(400)
          .json({ status: "error", message: "Enter correct Otp to proceed" });
        // loginLog.log("error", "Fail", {
        //   loginType: !userphoneNumber ? "Email" : "Mobile",
        //   loginKey: !userphoneNumber ? userMail : userphoneNumber,
        //   loginTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
        //   remark: "Enter correct Otp to proceed",
        //   ipAddress: req.ip,
        // });
        return;
      }
      if (user.dataValues.role === "ADMIN") {
        console.log('otdddddddddddddddddwwwwwwwwwwwdddddp',otp,userphoneNumber)
        if (user.dataValues.phoneNoVerified !== true) {
          res.status(400).json({
            status: "error",
            message: "user is not registered please signup",
          });
          // loginLog.log("error", "Fail", {
          //   loginType: !userphoneNumber ? "Email" : "Mobile",
          //   loginKey: !userphoneNumber ? userMail : userphoneNumber,
          //   loginTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
          //   remark: "user is not registered please signup",
          //   ipAddress: req.ip,
          // });
          return;
        }
        if (!user.dataValues.userJourneyStatus) {
          res.status(400).json({ status: "error", message: "Forbidden" });
          // loginLog.log("error", "Fail", {
          //   loginType: !userphoneNumber ? "Email" : "Mobile",
          //   loginKey: !userphoneNumber ? userMail : userphoneNumber,
          //   loginTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
          //   remark: "Forbidden",
          //   ipAddress: req.ip,
          // });
          return;
        }
        const stepData = await progressData(user.dataValues.id);
        res.status(200).json({ ...stepData });
        // loginLog.log("info", "Success", {
        //   userId: user._id.toString(),
        //   loginType: !userphoneNumber ? "Email" : "Mobile",
        //   loginKey: !userphoneNumber ? userMail : userphoneNumber,
        //   loginTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
        //   remark: "OTP verified successfully",
        //   ipAddress: req.ip,
        // });
        return;
      }
      const token = createJwtToken({
        user: user.dataValues.id,
        role: user.dataValues.role,
      });
      let org = await orgSchema.findOne({
        where: { id: user.dataValues.orgId },
      });
      userModel
        .update({ phoneOtp: "", token }, { where: { id: user.dataValues.id } })
        .then(async() => {
          // loginLog.log("info", "Success", {
          //   userId: user._id,
          //   loginType: !userphoneNumber ? "Email" : "Mobile",
          //   loginKey: !userphoneNumber ? userMail : userphoneNumber,
          //   loginTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
          //   remark: "OTP verified successfully",
          //   ipAddress: req.ip,
          // });
          if (user.role === "SADMIN") {
            let totalOrg = await orgSchema.count();
            let totalEmpCount = await userSchema.count({where:{role:{[Op.ne]:"SADMIN"}}});
            let totalPolicies = await planSchema.count();
            return res.status(200).json({
              status: "success",
              message: "OTP verified successfully",
              data: {
                token: token,
                userMail: user.dataValues.userMail,
                userName: user.dataValues.userName,
                role: user.dataValues.role,
                userphoneNumber: user.dataValues.userphoneNumber,
                adminEmpUploadFirstSet: user.dataValues.adminEmpUploadFirstSet,
                userProfileImagePath: user.dataValues.userProfileImagePath,
                userId: user.dataValues.id,
                planName: plan.planName,
                totalOrg,
                totalEmpCount,
                totalPolicies
              },
            });
          }
          return res.status(200).json({
            status: "success",
            message: "OTP verified successfully", 
            data: {
              token: token,
              userMail: user.dataValues.userMail,
              userName: user.dataValues.userName,
              role: user.dataValues.role,
              userphoneNumber: user.dataValues.userphoneNumber,
              adminEmpUploadFirstSet: user.dataValues.adminEmpUploadFirstSet,
              userProfileImagePath: user.dataValues.userProfileImagePath,
              userId: user.dataValues.id,
              planName: plan.planName,
              addressLine1: org.dataValues.addressLine1,
              addressLine2: org.dataValues.addressLine2,
              state: org.dataValues.state,
              city: org.dataValues.city,
              pincode: org.dataValues.pincode,
              planName: plan.planName,
              planExpiryDate: org.planExpiryDate,
              planStartDate: org.planStartDate,
              description: plan.planDesc,
              covered:plan.covered,
              notCovered: plan.notCovered,
              dob:user.dob,
              empid:user.empId,
              orgName:org.orgName,
              gender:user.gender,
              planType:org.planType

            },
          });
        });
    }
    if (!userphoneNumber && otp && userMail) {
      const user = await userModel.findOne({ where: { userMail: userMail } });
      if (!user) {
        res.status(400).json({
          status: "error",
          message: "user is not registered please signup",
        });
        // loginLog.log("error", "Fail", {
        //   loginType: !userphoneNumber ? "Email" : "Mobile",
        //   loginKey: !userphoneNumber ? userMail : userphoneNumber,
        //   loginTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
        //   remark: "User is not registered please signup",
        //   ipAddress: req.ip,
        // });
        return;
      }
      if (user.dataValues.mailOtp !== otp) {
        res
          .status(400)
          .json({ status: "error", message: "Enter correct Otp to proceed" });
        // loginLog.log("error", "Fail", {
        //   loginType: !userphoneNumber ? "Email" : "Mobile",
        //   loginKey: !userphoneNumber ? userMail : userphoneNumber,
        //   loginTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
        //   remark: "Enter correct Otp to proceed",
        //   ipAddress: req.ip,
        // });
      } else if (user.dataValues.mailOtp === otp) {
        const token = createJwtToken({
          user: user.dataValues.id,
          role: user.dataValues.role,
        });
        // user.token = token;
        await userModel
          .update({ token }, { where: { id: user.dataValues.id } })
          .then(() => {
            res.status(200).json({
              status: "success",
              message: "OTP verified successfully",
              data: {
                token: token,
                adminEmpUploadFirstSet: adminEmpUploadFirstSet,
                userProfileImagePath: user.dataValues.userProfileImagePath,
                userId: user.dataValues.id,
              },
            });
            // loginLog.log("info", "Success", {
            //   userId: user.dataValues.id.toString(),
            //   loginType: !userphoneNumber ? "Email" : "Mobile",
            //   loginKey: !userphoneNumber ? userMail : userphoneNumber,
            //   loginTime: moment(new Date()).format("DD-MM-YYYY  HH:mm:ss Z "),
            //   remark: "OTP verified successfully",
            //   ipAddress: req.ip,
            // });
          });
      }
      return;
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    logger
    console.log(error);
  }
};
module.exports = { login, verifyLogin };
