

const trails =(sequelize, DataTypes) => sequelize.define('historyTrail',{
    userId: { type:DataTypes.STRING },
    orgId: { type:DataTypes.STRING },
    lastLoginDate: {type:DataTypes.DATE},
    activity: { type:DataTypes.STRING},


});

module.exports = trails