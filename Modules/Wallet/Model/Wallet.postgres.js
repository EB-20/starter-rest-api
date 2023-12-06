const wallet = (sequelize, DataTypes) =>
  sequelize.define("wallet", {
    userId: { type: DataTypes.INTEGER },
    amount: { type: DataTypes.INTEGER, defaultValue: 0 },
  });

module.exports = wallet;
