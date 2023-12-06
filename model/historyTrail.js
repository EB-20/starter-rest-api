const mongoose = require('mongoose');

const trails = new mongoose.Schema({
    userId: { type: mongoose.ObjectId, unique: true, sparse: true },
    orgId: { type: mongoose.ObjectId, unique: true, sparse: true },
    lastLoginDate: Date,
    activity: { type: String },


});

const trail = mongoose.model('historyTrail', trails);
module.exports = trail;