
const history = []
const userSchema = require('../model/user.model');
const historySchema = require('../model/historyTrail');

const saveHistory = async(userId)=>{
    const user = await userSchema.findById(userId);
    const history = new historySchema({userId:user._id,orgId:user.orgId});
    await history.save()
    const userHistory = await historySchema.findOne({})
    

}
module.exports={saveHistory}