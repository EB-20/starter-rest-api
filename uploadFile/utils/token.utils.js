const jwt = require("jsonwebtoken");
// const { JWT_SECRET } = require("../config");
const decodeJwt = require('jwt-decode');
const userSchema = require('../model/user.model');
require('dotenv').config()

const createJwtToken = (payload) => {
  try {
    const token = jwt.sign(payload, process.env.SECRETKEY, { expiresIn: "900h" });
    return token;
  } catch (error) {
    console.log(error.message);
  }
};
const verifyJwtToken = async(req,res,next)=>{
  try {
  const token =req.body.token || req.query.token || req.headers["access-token"];
  if (!token) {
  res.status(400).json({status:"error",message:"Enter token to proceed"});
  return;
    }
      const decoded = jwt.verify(token, process.env.SECRETKEY);
      const decodedData = decodeJwt(token);
      const user = await userSchema.findById(decodedData.user)
      const superAdminId = await userSchema.findOne({role:"SADMIN"});
      if(!superAdminId){
        console.log("Initiate Seeders");
      }
      if(!user){
        res.status(400).json({status:"error",message:"User not found"});
        return;
      }
      req.user = user;
      req.superAdminData = superAdminId
      req.superAdminId = superAdminId._id
      next();

  } catch (error) {
    if (error.name === "TokenExpiredError"){
      res.status(400).json({status:"error", message:"Token is Expired"});
    }
    else{
      res.status(400).json({status:"error", message:error.message});
    }
  }
}

module.exports = {createJwtToken,verifyJwtToken}