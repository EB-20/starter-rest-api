const sdk = require("api")("@cashfreedocs-new/v3#173cym2vlivg07d0");
const ShortUniqueId = require("short-unique-id");
const { progressData } = require("../../../utils/progressData");
const fs = require("fs-extra");
const pdf = require("pdfkit");
const { uploadToS3Bucket } = require("../../../utils/s3Config");
const { createJwtToken } = require("../../../utils/token.utils");
const { unlink } = require("fs");
require("dotenv").config();
const {
  userSchema,
  orgs: orgModel,
  orderPay: orderModel,
  walletTransaction,
} = require("../../../PostgresModels");
const payment = async (req, res) => {
  try {
    const user = req.user;
    const uid = new ShortUniqueId({ length: 10 });
    const uuid = uid();
    let price;
    const uniqueId = user.id + "_" + uuid + "_" + Date.now();
    const { dataValues: org } = await orgModel.findOne({
      where: { id: user.orgId },
    });
    const invoice = await orderModel.count();
    const iNo = `${0o000}` + Number(invoice) + 1;
    if (!org.totalPlanPrice) {
      res.status(400).json({ status: "error", message: "plan not purchased" });
      return;
    }
    if (!org.planType) {
      return res
        .status(400)
        .json({ status: "error", message: "plan period not defined" });
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
    const orderExists = await orderModel.findOne({
      where: { orderId: uniqueId },
    });
    const invoiceNumber = user.orgId + "_" + Date.now();
    if (orderExists) {
      res.status(400).json({ status: "error", message: "order already exist" });
      return;
    }
    if(org.partOfSEZ===true){
      price = Number(org.totalPlanPrice);
    }
    else if(org.partOfSEZ===false){
      price= Number((org.totalPlanPrice + org.totalPlanPrice * 0.18).toFixed(0));

    }
    else{
      res
      .status(400)
      .json({ status: "error", message: "Part Of SEZ details not provided" });
    return;
    }
    if (!orderExists) {
      // console.log(
      //   {
      //     userId: user.id,
      //     orderId: uniqueId,
      //     orgId: user.orgId,
      //     orderPrice: price,
      //     orderStatus: "PENDING",
      //     invoiceNumber: invoiceNumber,
      //     invoiceNo: iNo,
      //   },
      //   ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>"
      // );
      await orderModel.create({
        userId: user.id,
        orderId: uniqueId,
        orgId: user.orgId,
        orderPrice: price,
        orderStatus: "PENDING",
        invoiceNumber: invoiceNumber,
        invoiceNo: iNo,
      });
      await walletTransaction.bulkCreate([
        {
          userId: user.id,
          orderAmount: price,
          orderId: uniqueId,
          planId: null,
          tnxType: "PAID",
          status: "PENDING",
        },
        {
          userId: user.id,
          orderAmount: price,
          orderId: uniqueId,
          planId: null,
          tnxType: "ADD",
          status: "PENDING",
        },
      ]);
    }
    const orderInfo = await orderModel.findOne({ where: { userId: user.id } });
    const date = new Date(orderInfo.dataValues.createdAt.getTime());
    console.log(date, "Created Date");
    let updDate;
    if (org.planType === "halfYearlyPrice") {
      updDate = date.setMonth(date.getMonth() + 6);
    } else if (org.planType === "quarterlyPrice") {
      updDate = date.setMonth(date.getMonth() + 3);
    } else if (org.planType === "monthlyPrice") {
      updDate = date.setMonth(date.getMonth() + 1);
    } else if (org.planType === "annuallyPrice") {
      updDate = date.setFullYear(date.getFullYear() + 1);
    }
    let expiryDate = new Date(updDate);
    const stepData = await progressData(user._id);
    if (user.userJourneyStatus === "DONE") {
      res.status(200).json({ ...stepData });
      return;
    }
    const token = createJwtToken({ user: user.id, role: user.role });
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
          link_amount: price,
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
      .then(({ data }) =>
        res.status(200).json({ status: "success", data, user })
      )
      .then(async () => {
        await userSchema.update(
          { userJourneyStatus: "DONE", token: token },
          { where: { id: user.id } }
        );
        await orgModel.update(
          {
            regStatus: "ACTIVE",
            planExpiryDate: expiryDate,
            planStartDate: orderInfo.dataValues.createdAt,
            
          },
          { where: { id: org.id } }
        );
        await orderModel.update(
          { orderStatus: "COMPLETE", expiryDate },
          { where: { id: orderInfo.dataValues.id } }
        );
      });
  } catch (error) {
    console.log(error);
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
        const org = await orgModel.findOne({ where: { id: user.orgId } });
        // const orgInfo = org.empAgeCount;
        res
          .status(200)
          .json({ status: "success", data: org.dataValues.empAgeCount });
      } else {
        res.status(400).json({
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
    const order = await orderModel.findOne({ where: { userId: user.id } });
    const org = await orgModel.findOne({ where: { id: user.orgId } });
    const invoiceName =
      org.dataValues.orgName +
      "_" +
      order.dataValues.invoiceNumber +
      "_" +
      Date.now();
    fs.appendFile(`uploadFile/${invoiceName}.pdf`, "");
    const filePath = `uploadFile/${invoiceName}.pdf`;
    let pdfDoc = new pdf();
    const s3FilePath = `EB/${req.superAdminId}/${user.orgId}/invoice/${invoiceName}.pdf`;
    // order.s3Path = s3FilePath
    await orderModel.update(
      { s3Path: s3FilePath },
      { where: { id: order.dataValues.id } }
    );
    // await order.save()
    pdfDoc.pipe(fs.createWriteStream(filePath));
    pdfDoc.fontSize(10).text(`Name: ${user.userName}\n`);
    pdfDoc.fontSize(10).text(`Payment Date: ${order.createdAt}\n`);
    pdfDoc.fontSize(10).text(`Transaction ID: ${order.orderId}\n`);
    pdfDoc.fontSize(10).text(`Company Name: ${org.orgName}\n`);
    pdfDoc.fontSize(10).text(`Company GST Number: ${org.companyGstNumber}\n`);
    pdfDoc.fontSize(10).text(`Amount: Rs${order.orderPrice}`);
    pdfDoc.end();
    const file = fs.readFileSync(`uploadFile/${invoiceName}.pdf`);
    await uploadToS3Bucket(file, s3FilePath);
    res.download(filePath);
    //cron job
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
module.exports = { payment, paymentSummary, paymentInvoiceDownload };
