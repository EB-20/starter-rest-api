const mongoose = require('mongoose');

const setting = new mongoose.Schema({
    app_auth:{type:String},
    smsUrl:{type:String},
    excelTojsonfilePath:{type:String}
})

const config = mongoose.model('setting' , setting);
module.exports = config;