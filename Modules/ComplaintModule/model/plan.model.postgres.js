const complaintInfo =(sequelize, DataTypes) => sequelize.define(
    "complaint",
    {
      userId:{type: DataTypes.INTEGER},
      assigneeId:{ type: DataTypes.STRING },
      orgId: { type: DataTypes.INTEGER },
      complaintStatus: { type: DataTypes.STRING, default: "SUBMITTED" },
      complaintDesc: { type: DataTypes.STRING },
      complaintType: { type: DataTypes.STRING },
      s3PathComplaintFile: { type: DataTypes.STRING },
    },
    { timestamps: true }
  );
  
  module.exports = complaintInfo;
  