


const notCoveredSchema =(sequelize, DataTypes) => sequelize.define('notCovered', {
    notCovered: {
        type: DataTypes.STRING,
      
        
    }
}, {

    // freezeTableName: true,
    tableName: "notCovered"
});

module.exports = notCoveredSchema




