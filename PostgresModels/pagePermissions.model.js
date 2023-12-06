

const pagePermission =(sequelize, DataTypes) => sequelize.define('pagePermission',{
    pagePermissions: { type:DataTypes.STRING }
})

module.exports = pagePermission;