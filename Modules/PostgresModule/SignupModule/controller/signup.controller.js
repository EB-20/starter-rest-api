
const axios = require('axios');
const userModel = require('../../../../PostgresModels/user.model')
const configSchema = require('../../../model/setting.model');
const planSchema = require('../../../PlanModule/model/plan.model.postgres')
const orgSchema = require('../../../../PostgresModels/orgs.model')
const { sendOtp } = require('../../../utils/otp');
const { createJwtToken } = require('../../../utils/token.utils');
// const { progressData } = require('../../../utils/progressData');

const signup = async (req, res) => {
    try {
        const { userphoneNumber } = req.body;
        if (!userphoneNumber) {
            res.status(400).json({ status: "error", message: "Enter Phone number to proceed" })
            return;
        }
        const numberExists = await userModel.findOne({ where: { userphoneNumber: userphoneNumber } });
        if (numberExists) {
            const { dataValues } = numberExists
            if (dataValues.phoneNoVerified === false) {
                const otp = await sendOtp(userphoneNumber);
                await userModel.update({ phoneOtp: otp }, { where: { id: dataValues.id } })
                res.status(200).json({ status: "success", message: "OTP sent to phone number" });
            }
            else if (dataValues.phoneNoVerified === true) {
                res.status(400).json({ status: "error", message: "Please login to continue" });
            }
        }
        else if (!numberExists) {
            const superAdmin = await userModel.findOne({ where: { role: 'SADMIN' } })
            const plan = await planSchema.findOne({ where: { planStatus: 'ACTIVE' } })
            if (!plan) {
                return res.status(400).json({ status: "error", message: "Plan not active" })
            }
            if (!superAdmin) {
                return res.status(400).json({ status: "error", message: "Can't register user Super Admin doesn't exists" })
            }
            const org = await orgSchema.create({ superAdminId: superAdmin.dataValues.id, planId: plan.dataValues.id, phoneNumber: userphoneNumber })
            const createNewUser = await userModel.create({
                userphoneNumber: userphoneNumber, permissions: ['add-Org', 'add-EMP', 'delete-EMP', 'update-EMP', 'view-EMP',
                    'add-HR', 'delete-HR', 'update-HR', 'view-HR', 'view-PLAN',
                    'view-PLANPRICEORG', 'add-ROLES', 'set-ROLES', 'view-allUserData'], superAdminId: superAdmin.dataValues.id, planId: plan.dataValues.id
                , role: 'ADMIN',
                userJourneyStatus: 'STEP0',
                phoneOtp: otp,
            });
            // const otp = await sendOtp(userphoneNumber)
            // user.role = 'ADMIN'
            // user.userJourneyStatus = 'STEP0'
            // user.phoneOtp = otp;
            // await user.save().then(() => {
            res.status(200).json({
                status: "success",
                message: "OTP sent to mobile number"
            })
            // })
        }
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
}
const verifySignup = async (req, res) => {
    try {
        const { userphoneNumber, otp } = req.body;
        // req.userPhone = userphoneNumber;
        if (!userphoneNumber) {
            res.status(400).json({ status: "error", message: "Enter Phone number to proceed" })
            return;
        }
        if (!otp) {
            res.status(400).json({ status: "error", message: "Enter Otp to proceed" })
            return;
        }
        const user = await userModel.findOne({ userphoneNumber: userphoneNumber })
        if (!user) {
            res.status(400).json({ status: "error", message: "User doesn't exists please signup" })
            return;
        }
        const token = createJwtToken({ user: user._id, role: user.role });
        if (user.phoneNoVerified === true) {
            res.status(400).json({ status: "error", message: "Please Login to proceed" })
            return;
            // let stepData = await progressData(user._id);
            // res.status(200).json({...stepData})
        }
        if (user.phoneNoVerified === false && user.userJourneyStatus === 'STEP0') {
            if (user.phoneOtp !== otp) {
                res.status(400).json({ status: "error", message: "Enter correct Otp to proceed" })
            }
            else if (user.phoneOtp === otp) {
                res.status(200).json({
                    staus: "success",
                    message: "OTP verified successfully",
                    data: {
                        token: token,
                        role: user.role
                    }
                })
                user.token = token;
                user.phoneNoVerified = true
                await user.save()
            }
        }
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
}

module.exports = { signup, verifySignup };