
const relationSchema = (sequelize, DataTypes) =>
  sequelize.define(
    "relation",
    {
      relation: { type: DataTypes.STRING },
    },
    { timestamps: true }
  );

module.exports = relationSchema;
