

const coveredSchema = (sequelize, DataTypes) => sequelize.define('covered', {

    covered: {
        type: DataTypes.STRING,
        
    }
}, {

    // freezeTableName: true,
    tableName: "covered"
});

module.exports = coveredSchema




