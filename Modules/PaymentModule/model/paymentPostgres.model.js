

const orderPay =(sequelize, DataTypes) => sequelize.define(
  "order",
  {
    userId: { type: DataTypes.INTEGER },
    orderId: { type: DataTypes.STRING, unique: true, sparse: true },
    orgId: { type: DataTypes.INTEGER },
    orderPrice: { type: DataTypes.INTEGER },
    orderStatus: { type: DataTypes.STRING, default: "notStarted" },
    invoiceNumber: { type: DataTypes.STRING },
    invoiceNo: { type: DataTypes.STRING },
    s3Path: { type: DataTypes.STRING },
    period: { type: DataTypes.STRING, default: "ANNUALLY" },
    expiryDate: { type: DataTypes.DATE },
  },
  { timestamps: true }
);

module.exports = orderPay;
