const exceltojson = require('convert-excel-to-json')
const fs = require('fs-extra');
const config = require('../../../model/setting.model');
const userSchema = require('../../../model/user.model');
const orgSchema = require('../../../model/orgs.model');
const planSchema = require('../../PlanModule/model/plan.model')
const orderSchema = require('../../PaymentModule/model/payment.model');
const S3 = require('aws-sdk/clients/s3');
const multer = require('multer');
const historyTrail = require('../../../model/historyTrail');
require('dotenv').config()

const empUpload = async (req, res) => {
    try {
        if (req.file?.filename === null || req.file?.filename === 'undefined') {
            res.status(400).json({ status: "error", message: "file doesnt exist" });
            return;
        }
        else {
            const s3 = new S3({
                region: process.env.REGION,
                accessKeyId: process.env.ACCESSKEYID,
                secretAccessKey: process.env.SECRETACCESSKEY
            });
            let upload = multer({
                limits: 1024 * 1024 * 12,
                fileFilter: function (req, file, done) {
                    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf' || file.mimetype === 'application/doc' || file.mimetype === 'application/xls' || file.mimetype === 'application/word' || file.mimetype === 'application/zip' || file.mimetype === 'image/bmp') {
                        done(null, true);
                    } else {
                        done('error: please upload files with proper extensions', false)
                    }
                }
            })
            const configData = await config.find({ excelTojsonfilePath: { $exists: true } });
            const uploadPath = configData[0].excelTojsonfilePath;
            console.log(uploadPath);
            var filepath = uploadPath + req.file.filename;
            const { pageNo = 1, limit = 10, name = '', status = 'ACTIVE', employeeNo = '' } = req.query;
            const skip = (pageNo - 1) * limit;
            const jsonData = exceltojson({
                sourceFile: filepath,
                header: { rows: 1 },
                columnToKey: { "*": "{{columnHeader}}" },
            });
            await fs.remove(filepath);
            const fetchExistingUserData = await userSchema.find();
            const user = req.user;
            if (user.role !== 'ADMIN') {
                res.status(400).json({ status: "error", message: "Unauthorized" });

            }
            let orgID = user.orgId;
            if (!orgID) {
                res.status(400).json({ status: "error", message: "Organization not Found" });
                return;
            }
            const org = await orgSchema.findById(orgID);
            const plan = await planSchema.findOne({ planStatus: 'ACTIVE' });
            if (!plan) {
                return res.status(400).json({ status: "error", message: "Can't add users:no plan is active" });
            }
            const totalEmp = org.totalEmployee;
            let empArr = Object.values(jsonData);
            let empDataArr = empArr[0];
            let count = 1;
            let successDataArr = [];
            let missingDataArr = [];
            let emp = [];
            let error = {
                phoneNumberMissing: "Phone number is missing", userMailMissing: "User E-mail is missing",
                userNameMissing: "Name is missing", phoneNumberExist: "Phone Number is already taken",
                userMailExist: "E-mail is already taken", phoneNumberNotValid: "Phone Number is not Valid",
                exceedsLimit: `Can only add ${totalEmp} employees`
            };
            let phoneRegex = new RegExp(/^[$5-9]\d{0,9}$/);
            let mailRegex = new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+/);
            for (let i = 0; i < empDataArr.length; i++) {
                let filterErrorArr = [];
                let userName = empDataArr[i].Name;
                let orgId = user.orgId
                let planId = plan._id
                let superAdminId = user.superAdminId;
                let userphoneNumber = empDataArr[i].ContactNo;
                let userMail = empDataArr[i].Email;
                let empData = { userName, userphoneNumber, userMail, orgId, superAdminId, planId };
                let existingPhoneNumber = fetchExistingUserData.find(({ userphoneNumber }) => userphoneNumber === empDataArr[i].ContactNo);
                let existingMail = fetchExistingUserData.find(({ userMail }) => userMail === empDataArr[i].Email);
                if (!userName || !userphoneNumber || !userMail) {
                    if (!userName) {
                        filterErrorArr.push(error.userNameMissing);
                    }
                    if (!userphoneNumber) {
                        filterErrorArr.push(error.phoneNumberMissing);
                    }
                    if (!userMail) {
                        filterErrorArr.push(error.userMailMissing);
                    }
                    emp.push({ Details: empData, status: 'Failed', summary: filterErrorArr });
                    missingDataArr.push(empData);
                    continue;
                }
                if (userName && userphoneNumber && userMail) {
                    if (existingPhoneNumber || existingMail) {

                        if (existingMail) {
                            filterErrorArr.push(error.userMailExist);
                        }
                        if (existingPhoneNumber) {
                            filterErrorArr.push(error.phoneNumberExist);
                        }
                        emp.push({ Details: empData, status: 'Failed', summary: filterErrorArr });
                        missingDataArr.push(empData);
                        continue;
                    }
                    if (!String(userphoneNumber).match(phoneRegex) || !String(userMail).match(mailRegex)) {
                        if (!String(userphoneNumber).match(phoneRegex)) {
                            filterErrorArr.push(error.phoneNumberNotValid);
                        }
                        if (!String(userMail).match(mailRegex)) {
                            filterErrorArr.push(error.userMailNotValid);
                        }
                        emp.push({ Details: empData, status: 'Failed', summary: filterErrorArr });
                        missingDataArr.push(empData);
                        continue;
                    }
                    if (count > totalEmp) {
                        filterErrorArr.push(error.exceedsLimit)
                        emp.push({ Details: empData, status: 'Failed', summary: filterErrorArr });
                        missingDataArr.push(empData);
                        continue;
                    }
                    else {
                        count = count + 1
                        emp.push({ Details: empData, status: 'Success' });
                        successDataArr.push(empData);
                    }
                }
            }
            const empUploadData = successDataArr.map(empDataArr => {
                return { ...empDataArr };
            })
            await userSchema.insertMany(empUploadData);
            user.adminEmpUploadFirstSet = true;
            org.empUploadFirstSet = true;
            org.userUploaded = count
            await org.save()
            await user.save()
            res.status(200).json({ status: "success", userData: emp });
        }
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
}
const viewTransaction = async (req, res) => {
    try {
        const user = req.user
        const { sort = 'COMPLETE' } = req.query
        let order;
        if (sort === 'All') {
            order = await orderSchema.find({ userId: user._id });
        }
        else { order = await orderSchema.find({ $and: [{ userId: user._id }, { orderStatus: sort }] }); }
        if (!order) {
            return res.status(400).json({ status: "error", message: "No Transaction found" });
        }
        const org = await orgSchema.findById(user.orgId)
        if(!org){
            return res.status(400).json({status:"error",message:"Org not found"})
        }
        if(!org.planType){
            return res.status(400).json({status:"error",message:"Org plan not found"})
        }
        order[0].period = org.planType
        res.status(200).json({
            status: "success", data: {
                order
            }
        })
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
}
const adminEmpStatus = async (req, res) => {
    try {
        const user = req.user
        const empData = await userSchema.find({ orgId: user.orgId });
        if (!empData) {
            return res.status(400).json({ status: "error", message: "Not associated with any org" });
        }
        const org = await orgSchema.findById(user.orgId);
        const empCount = org.totalEmployee;
        const totalEmpActive = await userSchema.find({ $and: [{ orgId: org._id }, { userStatus: { $eq: 'ACTIVE' } }, { role: { $ne: 'ADMIN' } }] }).count()
        const totalEmpNotActive = await userSchema.find({ $and: [{ orgId: org._id }, { userStatus: { $eq: 'PURGED' } }, { role: { $ne: 'ADMIN' } }] }).count()
        const transactionId = await orderSchema.find({ userId: user._id }).sort({ createdAt: 1 }).limit(1)
        const percentActive = Math.round((totalEmpActive / empCount) * 100)
        res.status(200).json({
            status: "success", data: {
                TotalActivated: empCount,
                TotalOnboarded: totalEmpActive,
                TotalDeactivated: totalEmpNotActive,
                latestTransactionId: transactionId,
                DeactivationPending: totalEmpNotActive,
                percentActive: percentActive
            }
        })
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
}
module.exports = { empUpload, viewTransaction, adminEmpStatus };