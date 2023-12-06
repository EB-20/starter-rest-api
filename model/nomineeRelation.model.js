const mongoose = require('mongoose')

const nomineeRelation = new mongoose.Schema({
   id:{type:String}, name:{type:String},
},{timestamps:true})

const nomineeRe = mongoose.model('nomineeRelation',nomineeRelation)

module.exports = nomineeRe
