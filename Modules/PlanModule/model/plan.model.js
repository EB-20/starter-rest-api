const mongoose = require("mongoose");
const planSchema = new mongoose.Schema({
  planId: {
    type: String,
    ref: 'planDetailSchema'
  },
  planName: { type: String },
  planStatus: { type: String, defaultValue: 'NOT-ACTIVE' },
  planDesc:{type:String},
  planLogoPath:{type:String},
  planPrice:{type:Array},
  notCovered:{type:Array},
  covered:{type:Array}
});  

const plan = mongoose.model("planSchema", planSchema);
module.exports = plan;
