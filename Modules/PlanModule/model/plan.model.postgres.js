

const planSchema =(sequelize, DataTypes) => sequelize.define("planSchema", {
  planId: { type: DataTypes.STRING },
  planName: { type: DataTypes.STRING },
  planStatus: { type: DataTypes.STRING, defaultValue: "NOT-ACTIVE" },
  planDesc: { type: DataTypes.STRING },
  planLogoPath: { type: DataTypes.STRING },
  notCovered: {
    type: DataTypes.STRING,
    get: function () {
      return JSON.parse(this.getDataValue("notCovered"));
    },
    set: function (val) {
      return this.setDataValue("notCovered", JSON.stringify(val));
    },
  },
  covered: {
    type: DataTypes.STRING,
    get: function () {
      return JSON.parse(this.getDataValue("notCovered"));
    },
    set: function (val) {
      return this.setDataValue("notCovered", JSON.stringify(val));
    },
  },
});

// planSchema.hasMany(userSchema, { foreignKey: "planId" });
// planSchema.hasMany(orgs, { foreignKey: "planId" });
// userSchema.belongsTo(planSchema);
// orgs.belongsTo(planSchema);
module.exports = planSchema;
