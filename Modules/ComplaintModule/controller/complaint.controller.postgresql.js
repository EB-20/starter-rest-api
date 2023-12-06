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
    complaintSchema,
} = require("../../../PostgresModels");
const { uploadToS3Bucket } = require("../../../utils/s3Config");
const fs = require("fs");

const complaint = async (req, res) => {
    const user = req.user;
    const { complaintDesc, complaintType } = req.body;
    let complaintData = {};

    complaintData.complaintDesc = complaintDesc;
    complaintData.complaintType = complaintType;
    complaintData.orgId = user.orgId;
    complaintData.userId = user.id;

    if (!req.file) {
        return res.status(400).json({ status: "error", message: "Provide file" })
    }
    if (!complaintDesc) {
        return res.status(400).json({ status: "error", message: "Provide complaint description" })
    }
    if (!complaintType) {
        return res.status(400).json({ status: "error", message: "Provide complaint type" })
    }
    if (user.role === 'ADMIN' && user.role != 'SADMIN') {
        complaintData.assigneeId = user.superAdminId
    }
    else if (user.role != 'SADMIN' && user.role != 'ADMIN') {
        complaintData.assigneeId = user.adminId
    }
    else {
        return res.status(400).json({ status: "error", message: "Invalid request" })
    }
    const path = `EB/${user.superAdminId}/${user.orgId}/${user.id}/complaintFile/${req.file.filename}`;
    const readFile = fs.readFileSync(req.file.path);
    await uploadToS3Bucket(readFile, path);
    fs.unlink(`complaintFile/${req.file.filename}`, (err) => {
        if (err) {
            console.log(
                `some error occured in removing the following file ${req.file.path}`
            );
        }
    });
    complaintData.s3PathComplaintFile = path;
    await complaintSchema.create({complaintDesc:complaintDesc});

    res.status(200).json({status:"success",message:"Complaint registered successfully",complaintData})

}
module.exports = { complaint }