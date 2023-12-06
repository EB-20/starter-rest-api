



const coveredNotCovered =(sequelize, DataTypes) => sequelize.define('coverednotcovered', {

  coverednotcovered: {
    type: DataTypes.STRING,
  }
}, {

  // freezeTableName: true,
  tableName: "coverednotcovered"
});

module.exports = coveredNotCovered




