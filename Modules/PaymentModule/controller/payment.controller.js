const sdk = require("api")("@cashfreedocs-new/v3#173cym2vlivg07d0");
const ShortUniqueId = require("short-unique-id");
const orderModel = require("../model/payment.model");
const orgModel = require("../../../model/orgs.model");
const { progressData } = require("../../../utils/progressData");
const fs = require("fs-extra");
const pdf = require('pdfkit');
const { uploadToS3Bucket } = require('../../../utils/s3Config');
const { createJwtToken } = require("../../../utils/token.utils");
const { unlink } = require("fs");
require("dotenv").config();

const payment = async (req, res) => {
  try {
    const user = req.user;
    const uid = new ShortUniqueId({ length: 10 });
    const uuid = uid();
    const uniqueId = user._id + "_" + uuid+ "_" + Date.now();
    const org = await orgModel.findById(user.orgId);
    const invoice = await orderModel.find().count()
    const iNo = `${0o000}`+Number(invoice)+1
    if (!org.totalPlanPrice) {
      res.status(400).json({ status: "error", message: "plan not purchased" });
      return;
    }
    if(!org.planType){
      return res.status(400).json({status:"error",message:"plan period not defined"});
    }
    if (!user.orgId) { 
      res
        .status(400)
        .json({ status: "error", message: "User not associated with any org" });
      return;
    }
    if (
      !(user.userJourneyStatus === "STEP3" || user.userJourneyStatus === "DONE")
    ) {
      res
        .status(400)
        .json({ status: "error", message: "Complete previous steps" });
      return;
    }
    const orderExists = await orderModel.findOne({ orderId: uniqueId });
    const invoiceNumber = user.orgId + "_" + Date.now();
    if (orderExists) {
      res.status(400).json({ status: "error", message: "order already exist" });
      return;
    }
    const price = org.totalPlanPrice;
    const priceWithGst = price + price * 0.18;
    if (!orderExists) {
      const order = new orderModel({
        userId: user._id,
        orderId: uniqueId,
        orgId: user.orgId,
        orderPrice: org.totalPlanPrice,
        orderStatus: "PENDING",
        invoiceNumber: invoiceNumber,
        invoiceNo:iNo
      });
      await order.save();
    }
    const orderInfo = await orderModel.findOne({ userId: user._id });
    const date = new Date(orderInfo.createdAt.getTime())
    console.log(date,"Created Date");
    let updDate;
    if(org.planType==='halfYearlyPrice'){
      updDate = date.setMonth(date.getMonth() + 6)
    }
    else if(org.planType==='quarterlyPrice'){
      updDate = date.setMonth( date.getMonth() + 3)
    }
    else if(org.planType==='monthlyPrice'){
      updDate = date.setMonth( date.getMonth() + 1)
    }
    else if(org.planType==='annuallyPrice'){
      updDate = date.setFullYear(date.getFullYear() + 1)
    }

    let expiryDate = new Date(updDate)
    const stepData = await progressData(user._id);
    if (user.userJourneyStatus === "DONE") {
      res.status(200).json({ ...stepData });
      return;
    }
    const token = createJwtToken({ user: user._id, role: user.role });
    user.token = token;
    await sdk
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
            return_url: `http://localhost:5173/success-payment/${uniqueId}`,
          },
          link_id: uniqueId,
          link_amount: priceWithGst,
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
      .then(({ data }) => res.status(200).json({ status: "success", data, user }))
      .then(() => {
        user.userJourneyStatus = "DONE";
        orderInfo.orderStatus = "COMPLETE";
        org.regStatus = "ACTIVE";
        orderInfo.expiryDate = expiryDate
        org.planExpiryDate = expiryDate
        org.planStartDate = orderInfo.createdAt
      })
      .then(() => {
        user.save();
        orderInfo.save();
        org.save();
      });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });

  }

};
const paymentSummary = async (req, res) => {
  try {
    const user = req.user;
    if (!(user.role === "ADMIN" || user.role === "SADMIN")) {
      res.status(400).json({ status: "error", message: "Unauthorized" });
    } else {
      if (user.userJourneyStatus === "STEP3") {
        const org = await orgModel.findById(user.orgId);
        const orgInfo = org.empAgeCount;
        res.status(200).json({ status: "success", data: org.empAgeCount });
      } else {
        res
          .status(400)
          .json({
            status: "error",
            message: "Company information incomplete can't initiate payment",
          });
      }
    }
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
const paymentInvoiceDownload = async (req, res) => {
  try {
    const user = req.user;
    const order = await orderModel.findOne({ userId: user._id });
    const org = await orgModel.findById(user.orgId);
    const invoiceName = org.orgName + "_" + order.invoiceNumber+"_"+Date.now();
    fs.appendFile(`uploadFile/${invoiceName}.pdf`,"")
    const filePath = `uploadFile/${invoiceName}.pdf`;
    let pdfDoc = new pdf();
    const s3FilePath = `EB/${req.superAdminId}/${user.orgId}/invoice/${invoiceName}.pdf`
    order.s3Path = s3FilePath
    await order.save()
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.fontSize(10).text(`Name: ${user.userName}\n`);
    pdfDoc.fontSize(10).text(`Payment Date: ${order.createdAt}\n`);
    pdfDoc.fontSize(10).text(`Transaction ID: ${order.orderId}\n`);
    pdfDoc.fontSize(10).text(`Company Name: ${org.orgName}\n`);
    pdfDoc.fontSize(10).text(`Company GST Number: ${org.companyGstNumber}\n`);
    pdfDoc.fontSize(10).text(`Amount: Rs${order.orderPrice}`);
    pdfDoc.end()
    const file = fs.readFileSync(`uploadFile/${invoiceName}.pdf`)
    await uploadToS3Bucket(file, s3FilePath)
    res.download(filePath)
    //cron job
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
module.exports = { payment, paymentSummary, paymentInvoiceDownload };