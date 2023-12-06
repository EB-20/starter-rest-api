const mongoose = require('mongoose')

const orgs = new mongoose.Schema({
    orgName: { type: String, sparse: true },
    planId: { type: mongoose.ObjectId },
    adminId:{type:mongoose.ObjectId},
    phoneNumber:{type:String},
    eMail:{type:String},
    superAdminId: { type: mongoose.ObjectId },
    totalEmployee: { type: Number, sparse: true },
    companyGstNumber: { type: String, unique: true, sparse: true },
    partOfSEZ: { type: Boolean, default: false },
    addressLine1: { type: String ,default:null},
    addressLine2: { type: String ,default:null},
    city: { type: String,default:null },
    empUploadFirstSet:{type:Boolean,enum:[true,false],default:false},
    state: { type: String,default:null },
    pincode: { type: String ,default:null},
    empAgeCount: Object,
    wlsPath:{type:String},
    totalPlanPrice: { type: Number },
    userUploaded:{type:Number,sparse:true,default:0},
    regStatus: { type: String, enum: ['NON-ACTIVE', 'ACTIVE', 'PURGED', 'ARCHIVED'], default: 'NON-ACTIVE' },
    planPeriod:{type:String,default:"ANUALLY"},
    planExpiryDate:{type:Date},
    planStartDate:{type:Date},
    planType:{type:String}

}, { timestamps: true });

orgs.index({
    orgName: "text",
    regStatus: "text",

})
const org = mongoose.model('org', orgs)
org.createIndexes()
module.exports = org;