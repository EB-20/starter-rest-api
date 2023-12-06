

const family =(sequelize, DataTypes) => sequelize.define('familydetail',{
    orgId: { type: DataTypes.INTEGER },
    userId: {  type: DataTypes.INTEGER },
    spouse: { type: DataTypes.JSONB, defaultValue: null },
    childOne: {  type: DataTypes.JSONB, defaultValue: null },
    childTwo: {  type: DataTypes.JSONB, defaultValue: null },
    nominee: { type: DataTypes.STRING, defaultValue: 'spouse' }
}, { timestamps: true })

module.exports = family;