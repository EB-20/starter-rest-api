const mongoose = require('mongoose');

const orderPay = new mongoose.Schema({
    userId: { type: mongoose.ObjectId,
                ref:'user' },
    orderId: { type: String, unique: true, sparse: true },
    orgId: { type: mongoose.ObjectId },
    orderPrice: String,
    orderStatus: { type: String, default: 'notStarted' },
    invoiceNumber:{type:String},
    invoiceNo:{type:String},
    s3Path:{type:String},
    period:{type:String,default:"ANNUALLY"},
    expiryDate:{type:Date}

}, { timestamps: true })
const orderPayment = mongoose.model('order', orderPay);
module.exports = orderPayment;
