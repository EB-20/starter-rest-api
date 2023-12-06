

const setting =(sequelize, DataTypes) => sequelize.define("setting",{
    app_auth:{type:DataTypes.STRING},
    smsUrl:{type:DataTypes.STRING},
    excelTojsonfilePath:{type:DataTypes.STRING}
})

module.exports = setting;