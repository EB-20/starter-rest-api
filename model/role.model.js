const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role:{type:String,
        ref:'user'},
    permissions:[{type:String}]
},
{timestamps:true})

const role = mongoose.model('role' , roleSchema)
module.exports = role;