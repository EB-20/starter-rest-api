const mongoose  = require('mongoose');

const pin = new mongoose.Schema({
    officeName: {type:String},
    pincode:{type:Number} ,
    taluk:{type:String} ,
    districtName:{type:String} ,
    stateName:{type:String} 
  })

const pinCode = mongoose.model('PIN',pin);
module.exports = pinCode;