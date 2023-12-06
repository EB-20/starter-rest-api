const walletTransaction = (sequelize, DataTypes) =>
  sequelize.define("walletTransaction", {
    userId: { type: DataTypes.INTEGER },
    orderAmount: { type: DataTypes.INTEGER },
    orderId: { type: DataTypes.STRING },
    planId: { type: DataTypes.INTEGER },
    tnxType: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING },
  });

module.exports = walletTransaction;
