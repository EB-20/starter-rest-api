const { sequelize } = require("../../../connection");
const { DataTypes } = require("sequelize");

const planDetailSchema = (sequelize, DataTypes) =>
  sequelize.define("planDetailSchema", {
    planId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    planPriceId: {
      type: DataTypes.INTEGER,
    },
  });
module.exports = planDetailSchema;
