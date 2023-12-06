const roleSchema =(sequelize, DataTypes) => sequelize.define('role',{
    role:{type:DataTypes.STRING},
    permissions:{type:DataTypes.JSONB}
},
{timestamps:true})

module.exports = roleSchema;