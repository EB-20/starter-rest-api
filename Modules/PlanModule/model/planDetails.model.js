const mongoose = require("mongoose");
const planDetailSchema = new mongoose.Schema({
  planId: {
    type: String,
    ref: 'planSchema'
  },
  planPrice: [{ ageBand: Object, price: Object }]
});

const planDetails = mongoose.model("planDetailSchema", planDetailSchema);
module.exports = planDetails;

