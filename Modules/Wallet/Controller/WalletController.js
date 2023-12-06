const ShortUniqueId = require("short-unique-id");
const {
  orderPay,
  walletTransaction,
  wallet,
} = require("../../../PostgresModels");

const sdk = require("api")("@cashfreedocs-new/v3#173cym2vlivg07d0");
const walletController = {};
walletController.addAmount = async (req, res) => {
  try {
    const { amount } = req.body;
    const user = req.user;
    if (!amount) {
      res.status(400).json({ status: "error", message: "Amount is required" });
      return;
    }
    const uid = new ShortUniqueId({ length: 10 });
    const uuid = uid();
    const uniqueId = user.id + "_" + uuid + "_" + Date.now();
    const invoice = await orderPay.count();
    const iNo = `${0o000}` + Number(invoice) + 1;
    const orderExists = await orderPay.findOne({
      where: { orderId: uniqueId },
    });
    const invoiceNumber = user.orgId + "_" + Date.now();
    if (orderExists) {
      res.status(400).json({ status: "error", message: "order already exist" });
      return;
    }

    const order = await orderPay.create({
      userId: user.id,
      orderId: uniqueId,
      orgId: user.orgId,
      orderPrice: amount,
      orderStatus: "PENDING",
      invoiceNumber: invoiceNumber,
      invoiceNo: iNo,
    });
    const transaction = await walletTransaction.create({
      userId: user.id,
      orderAmount: amount,
      orderId: uniqueId,
      planId: null,
      tnxType: "ADD",
      status: "PENDING",
    });
    await sdk
      .createPaymentLink(
        {
          customer_details: {
            customer_phone: user.userphoneNumber,
            customer_email: user.userMail,
            customer_name: "ADD AMOUNT",
          },
          link_notify: { send_sms: true, send_email: true },
          link_meta: {
            notify_url:
              "https://typedwebhook.tools/webhook/aafe61ff-35ae-4aed-b211-5041719e9692",
            return_url: `http://localhost:5173/wallet-success/${uniqueId}&paymentType=add`,
          },
          link_id: uniqueId,
          link_amount: amount,
          link_currency: "INR",
          link_purpose: "EB INSURANCE",
          link_partial_payments: false,
          link_created_at: new Date(Date.now()).toString().slice(0, 15),
        },
        {
          "x-client-id": process.env.x_client_id,
          "x-client-secret": process.env.x_client_secret,
          "x-api-version": process.env.x_api_version,
        }
      )
      .then(({ data }) =>
        res.status(200).json({ status: "success", data, user })
      );
  } catch (e) {
    console.log(e);
  }
};
walletController.walletInfo = async (req, res) => {
  const user = req.user;
  const result = await wallet.findOne({
    where: {
      userId: user.id,
    },
  });
  if (result) {
    res.status(200).json({
      status: "success",
      data: result.dataValues,
    });
    return;
  }
  res.status(400).json({
    status: "success",
    message: "wallet not found",
  });
};
walletController.walletTransactions = async (req, res) => {
  const user = req.user;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const data = await walletTransaction.findAll({
    where: { userId: user.id },
    order: [["createdAt", "DESC"]],
    limit,
    offset: skip,
  });
  const totalTnx = await walletTransaction.count({
    where: { userId: user.id },
  });
  if (data) {
    res.status(200).json({
      status: "success",
      data: data,
      totalTnx,
      page,
      totalPages: Math.ceil(totalTnx / limit),
    });
    return;
  }
  res.status(400).json({ status: "error", message: "somthing went wrong" });
  return;
};
walletController.walletTransactionsNotify = async (req, res) => {
  const { link_amount, link_id, order, link_status, customer_details } =
    req.body;

  const data = await orderPay.findOne({
    where: { orderId: link_id, orderStatus: "PENDING" },
  });

  if (!data) {
    res.status(400).json({ status: "error", message: "Order not found" });
    return;
  }
  const walletData = await wallet.findOne({
    where: { userId: data.dataValues.userId },
  });
  data.status = "SUCCESS";
  data.orderDetails = JSON.stringify(order);
  await walletTransaction.update(
    { status: "SUCCESS" },
    {
      where: {
        orderId: link_id,
        status: "PENDING",
      },
    }
  );
  if (walletData) {
    if (customer_details.paymentType === "ADD AMOUNT") {
      walletData.amount = walletData.dataValues.amount + Number(link_amount);
    }
    await walletData.save();
  }

  await data.save();
  res.status(200).json({ status: "success", message: "wallet updated" });
};
walletController.walletTransactionSuccess = async (req, res) => {
  const user = req.user;
  const { tnxId } = req.body;

  const data = await orderPay.findOne({
    where: {
      orderId: tnxId,
      orderStatus: "PENDING",
    },
  });

  if (!data) {
    res.status(400).json({ status: "error", message: "Order not found" });
    return;
  }
  const walletData = await wallet.findOne({
    where: { userId: data.dataValues.userId },
  });
  data.status = "SUCCESS";
  // data.orderDetails = JSON.stringify(order);
  const result = await walletTransaction.findOne({
    where: {
      orderId: tnxId,
      status: "PENDING",
    },
  });
  if (walletData) {
    if (result.dataValues.tnxType == "ADD") {
      walletData.amount =
        walletData.dataValues.amount + Number(data.dataValues.orderPrice);
    }
    if (result.dataValues.tnxType == "PAID") {
      walletData.amount =
        walletData.dataValues.amount - Number(data.dataValues.orderPrice);
    }
    result.status = "SUCCESS";
    await walletData.save();
    await result.save();
    await data.save();
    res.status(200).json({ status: "success", message: "tnx updated" });
  } else {
    res.status(400).json({ status: "error", message: "SOMTHING WENT WRONG" });
    return;
  }
};
module.exports = walletController;
