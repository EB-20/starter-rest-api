

const pin =(sequelize, DataTypes) => sequelize.define('pin',{
    officeName: {type:DataTypes.STRING},
    pincode:{type:DataTypes.INTEGER} ,
    taluk:{type:DataTypes.STRING} ,
    districtName:{type:DataTypes.STRING} ,
    stateName:{type:DataTypes.STRING} 
  })

  
module.exports = pin;