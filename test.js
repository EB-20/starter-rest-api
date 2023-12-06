const { sequelize } = require("./connection");
const { DataTypes } = require("sequelize");

const workers = sequelize.define("workers", {
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  empId: { type: DataTypes.INTEGER },
  planId: { type: DataTypes.INTEGER },
});
const empPlans = sequelize.define("empPlans", {
  planName: { type: DataTypes.STRING },
});
const workerDetails = sequelize.define("workerDetails", {
  address: { type: DataTypes.STRING },
});
workers.hasOne(empPlans,{foreignKey:"planId",})
workers.hasOne(workerDetails,{foreignKey:'empId'})
module.exports =  { workers, empPlans, workerDetails };
