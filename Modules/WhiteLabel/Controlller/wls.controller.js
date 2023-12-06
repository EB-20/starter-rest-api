const fs = require("fs");
var AWS = require("aws-sdk");
const { uploadToS3Bucket } = require("../../../utils/s3Config");
const orgSchema = require("../../../model/orgs.model");
const userSchema = require("../../../model/user.model");
const S3 = require("aws-sdk/clients/s3");

const wlsGetData = async (req, res) => {

  let user = req.user;
  let superAdmin = req.superAdminData
  let s3 = new S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    region: process.env.REGION,
  });
  if(user.role==='SADMIN'){
    const paramsGet = {
      Bucket: process.env.BUCKET,
      Key: superAdmin.wlsPath,
    }
   s3.getObject(paramsGet, function (err, data) {
      res
        .status(200)
        .send(JSON.parse(new Buffer.from(data.Body).toString("utf8")));
    })
  }
  else{
    let org = await orgSchema.findById(user.orgId);
    if (!org) {
      return res
        .status(400)
        .json({ status: "error", message: "Not associated with any Org" });
    }
    if (!org.wlsPath) {
      if (!superAdmin) {
        response
          .status(404)
          .json({ status: "error", message: "Super Admin not found" });
      } 
      else {
        if (!superAdmin.wlsPath) {
          response
            .status(404)
            .json({ status: "error", message: "No WLS path found" });
        } 
        else {
          let paramsGet = {
            Bucket: process.env.BUCKET,
            Key: superAdmin.wlsPath,
          };
          s3.getObject(paramsGet, function (err, data) {
            if(err){
              return res.status(400).json({status:"error",message:err})
            }
            res
              .status(200)
              .send(JSON.parse(new Buffer.from(data.Body).toString("utf8")));
          });
        }
      }
    }
    else{
      const paramsGet = {
        Bucket: process.env.BUCKET,
        Key: org.wlsPath,
      };

  s3.getObject(paramsGet, function (err, data) {
    res
      .status(200)
      .send(JSON.parse(new Buffer.from(data.Body).toString("utf8")));
  })
    }
  }     
  }
const wls = async (req, res) => {
  const user = req.user;
  let jsonData = [];
  let finalObj = {};
  const data = req.body;
  jsonData.push(data);
  for (let i = 0; i < jsonData.length; i++) {
    Object.assign(finalObj, jsonData[i]);
  }
  let json = JSON.stringify(finalObj);
  if(!data){
    return res.status(400).json({ status: "error", message: "Wls data not found"}); 
   }
  let org = await orgSchema.findById(user.orgId);
  if(user.role==='SADMIN'){
    const sadmin = await userSchema.findById(req.superAdminId)
    if(!sadmin){
      return res.status(400).json({status:"error",message:"Super Admin not found"});
    }
    let filePath = "EB/defaultWLS/data.json"
    sadmin.wlsPath = filePath
    await sadmin.save()
    await uploadToS3Bucket(json,filePath)
  }
  else if(user.role==='ADMIN'){
    if(!org){
      return res.status(400).json({ status: "error", message: "Not associated with any Org" }); 
     }
     {
      let s3Path = `EB/${req.superAdminId}/${user.orgId}/wlsTheme/data.json`
       org.wlsPath = s3Path
       await org.save()
       await uploadToS3Bucket(json,s3Path)
    }
  }
  else{
    return res.status(401).json({status:"error",message:"Unauthorized"});
  }
  res.status(200).json({status:"success",message:"Updated Theme"})
};

module.exports = { wls, wlsGetData };
