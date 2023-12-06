const mongoose = require('mongoose')

const family = new mongoose.Schema({
    orgId: { type: mongoose.ObjectId },
    userId: { type: mongoose.ObjectId },
    spouse: { type: Object, default: null },
    childOne: { type: Object, default: null },
    childTwo: { type: Object, default: null },
    nominee: { type: String, default: 'spouse' }
}, { timestamps: true })

const Family = mongoose.model('familyDetails', family);
module.exports = Family;