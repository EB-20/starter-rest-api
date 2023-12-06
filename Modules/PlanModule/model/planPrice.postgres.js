const planPriceTable = (sequelize, DataTypes) =>
  sequelize.define("planPriceTable", {
    planSchemaId: {
      type: DataTypes.INTEGER,

    },


    ageBand: {
      type: DataTypes.STRING,
    },
    monthlyPrice: {
      type: DataTypes.INTEGER,
    },
    quarterlyPrice: {
      type: DataTypes.INTEGER,
    },
    halfYearlyPrice: {
      type: DataTypes.INTEGER,
    },
    annuallyPrice: {
      type: DataTypes.INTEGER,
    },
  });

module.exports = planPriceTable;
