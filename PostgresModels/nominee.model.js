

const nomineeSchema = (sequelize, DataTypes) => sequelize.define('nominee',{
    userId: { type:DataTypes.STRING},
    dob: { type:DataTypes.DATE },
    name: {type:DataTypes.STRING},
    relation: { type:DataTypes.STRING },
}, { timestamps: true });


module.exports = nomineeSchema;