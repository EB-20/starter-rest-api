

const nomineeRelation = (sequelize, DataTypes) => sequelize.define('nomineeRelation', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true }, name: { type: DataTypes.STRING },
}, { timestamps: true })

module.exports = nomineeRelation