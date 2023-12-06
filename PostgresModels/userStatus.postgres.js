const userStatusSchema = (sequelize, DataTypes) =>
  sequelize.define(
    "userStatusSchema",
    {
      status: {
        type: DataTypes.STRING,
      },
    },
    { timestamps: true }
  );

module.exports = userStatusSchema;
