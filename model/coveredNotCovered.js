const mongoose = require('mongoose')

const coveredNotCovered = new mongoose.Schema({
    coveredNotCovered:{type:Object},
})

const coveredAndNotCovered = mongoose.model('coveredNotCovered',coveredNotCovered)
module.exports = coveredAndNotCovered