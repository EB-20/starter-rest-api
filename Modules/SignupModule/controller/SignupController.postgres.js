const {
  userSchema: userModel,
  setting: configSchema,
  planSchema,
  orgs: orgSchema,
  wallet,
} = require("../../../PostgresModels");
const axios = require("axios");
const { sendOtp } = require("../../../utils/otp");
const { createJwtToken } = require("../../../utils/token.utils");
const { progressData } = require("../../../utils/progressData");

const signup = async (req, res) => {
  try {
    const { userphoneNumber } = req.body;
    if (!userphoneNumber) {
      res
        .status(400)
        .json({ status: "error", message: "Enter Phone number to proceed" });
      return;
    }
    const numberExists = await userModel.findOne({
      where: { userphoneNumber: userphoneNumber },
    });
    if (numberExists) {
      if (numberExists.dataValues.phoneNoVerified === false) {
        const otp = await sendOtp(userphoneNumber);
        await userModel.update(
          { phoneOtp: otp },
          { where: { id: numberExists.dataValues.id } }
        );
        // await numberExists.save();
        res
          .status(200)
          .json({ status: "success", message: "OTP sent to phone number" });
      } else if (numberExists.dataValues.phoneNoVerified === true) {
        res
          .status(400)
          .json({ status: "error", message: "Please login to continue" });
      }
    } else if (!numberExists) {
      const superAdmin = await userModel.findOne({ where: { role: "SADMIN" } });
      const plan = await planSchema.findOne({
        where: { planStatus: "ACTIVE" },
      });
      if (!plan) {
        return res
          .status(400)
          .json({ status: "error", message: "Plan not active" });
      }
      if (!superAdmin) {
        return res.status(400).json({
          status: "error",
          message: "Can't register user Super Admin doesn't exists",
        });
      }
      const createNewUser = await userModel.create({
        userphoneNumber: userphoneNumber,
        permissions: JSON.stringify([
          "add-Org",
          "add-EMP",
          "delete-EMP",
          "update-EMP",
          "view-EMP",
          "add-HR",
          "delete-HR",
          "update-HR",
          "view-HR",
          "view-PLAN",
          "view-PLANPRICEORG",
          "add-ROLES",
          "set-ROLES",
          "view-allUserData",
        ]),
        superAdminId: superAdmin.dataValues.id,
        planId: plan.dataValues.id,
      });
      console.log(createNewUser, "newuser");
      await orgSchema.create({
        superAdminId: superAdmin.dataValues.id,
        planId: plan.dataValues.id,
        phoneNumber: userphoneNumber,
      });
      const user = {};
      const otp = await sendOtp(userphoneNumber);
      user.role = "ADMIN";
      user.userJourneyStatus = "STEP0";
      user.phoneOtp = otp;
      userModel
        .update(user, {
          where: {
            id: createNewUser.dataValues.id,
          },
        })
        .then(() => {
          res.status(200).json({
            status: "success",
            message: "OTP sent to mobile number",
          });
        });
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};
const verifySignup = async (req, res) => {
  try {
    const { userphoneNumber, otp } = req.body;
    // req.userPhone = userphoneNumber;
    if (!userphoneNumber) {
      res
        .status(400)
        .json({ status: "error", message: "Enter Phone number to proceed" });
      return;
    }
    if (!otp) {
      res
        .status(400)
        .json({ status: "error", message: "Enter Otp to proceed" });
      return;
    }
    const user = await userModel.findOne({
      where: { userphoneNumber: userphoneNumber },
    });
    console.log(
      user.dataValues,
      "hfuiuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu"
    );
    if (!user) {
      res.status(400).json({
        status: "error",
        message: "User doesn't exists please signup",
      });
      return;
    }
    const token = createJwtToken({
      user: user.dataValues.id,
      role: user.dataValues.role,
    });
    console.log(user);
    if (user.dataValues.phoneNoVerified === true) {
      res
        .status(400)
        .json({ status: "error", message: "Please Login to proceed" });
      return;
      // let stepData = await progressData(user._id);
      // res.status(200).json({...stepData})
    }
    if (
      user.dataValues.phoneNoVerified === false &&
      user.dataValues.userJourneyStatus === "STEP0"
    ) {
      if (user.phoneOtp !== otp) {
        res
          .status(400)
          .json({ status: "error", message: "Enter correct Otp to proceed" });
      } else if (user.dataValues.phoneOtp === otp) {
        await wallet.create({
          userId: user.dataValues.id,
        });
        res.status(200).json({
          staus: "success",
          message: "OTP verified successfully",
          data: {
            token: token,
            role: user.dataValues.role,
          },
        });
        await userModel.update(
          { token: token, phoneNoVerified: true },
          { where: { id: user.dataValues.id } }
        );
      }
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
    console.log(error);
  }
};

module.exports = { signup, verifySignup };
