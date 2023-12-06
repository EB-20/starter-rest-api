const S3 = require('aws-sdk/clients/s3');
const multer = require('multer');
const router = require('express').Router();
const fs = require('fs');
require('dotenv').config()

//validation for files
let upload = multer({
  limits: 1024*1024*12,
  fileFilter: function(req,file,done){
    if(file.mimetype==='image/jpg' || file.mimetype==='image/jpeg' || file.mimetype==='image/png' || file.mimetype==='application/pdf' || file.mimetype==='application/doc' || file.mimetype==='application/xls' || file.mimetype==='application/word' || file.mimetype==='application/zip' ||file.mimetype=== 'image/bmp'){
      done(null,true);
    }else{
      done('error: please upload files with proper extensions' , false)
    }
  }
})
//upload file to s3 function
const uploadToS3Bucket = (file, filePath) => {
  return new Promise((resolve, reject) => {
    let s3 = new S3({
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY,
      region: process.env.REGION,
    });
    const bucketName = process.env.BUCKET;
    let bucketPath = filePath;
    let params = {
      Bucket: bucketName,
      Key: bucketPath,
      Body: file,
    };
    s3.upload(params, function (err, data) {
      if (err) {
        return err;
      } else {
        resolve();
      }
    });
  });
};
const downloadFromS3Bucket = async (filePath) => {
    // let s3 = new S3({
    //   accessKeyId: process.env.ACCESSKEYID,
    //   secretAccessKey: process.env.SECRETACCESSKEY,
    //   region: process.env.REGION,
    // });
    const bucketName = process.env.BUCKET;
    let bucketPath = filePath;
    // console.log(bucketPath);
    let params = {
      Bucket: bucketName,
      Key: bucketPath,
    };
    await s3.getObject(params)
    console.log(fileData);
};
    

// const uploadFiles = (req,res)=>{
//   // console.log(req.files);
//   // return
//   if(req.files && req.files.length>0){
//     for(var i = 0 ; i<req.files.length ; i++){
//       console.log("")
//       uploadS3(req.files[i].buffer).then((result)=>{
//         console.log('file URL', result.Location);
//        console.log({
//           msg : `${'dd'} files are uploaded successfully`
//         })
//     }).catch((e)=>console.log(e,"??????????"))
//   }
// }
// }
module.exports = {upload,uploadToS3Bucket,downloadFromS3Bucket};