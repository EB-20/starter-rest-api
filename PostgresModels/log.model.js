const logsSchema =(sequelize, DataTypes) => sequelize.define(
    "log",
    {
      userId:{type: DataTypes.INTEGER},
      orgId: { type: DataTypes.INTEGER },
      logoutTime:{ type: DataTypes.STRING },
      loginTime: { type: DataTypes.STRING },
      activityLogDesc: { type: DataTypes.STRING },
      complaintType: { type: DataTypes.STRING },
      s3PathLogFile: { type: DataTypes.STRING },
    },
    { timestamps: true }
  );
  
  module.exports = logsSchema;
  