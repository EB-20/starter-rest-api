

const permissionSchema =(sequelize, DataTypes) => sequelize.define('permission',{
    permissions: { type: DataTypes.STRING },
})

module.exports = permissionSchema;