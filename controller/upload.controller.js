const S3 = require('aws-sdk/clients/s3');
const multer = require('multer');
const router = require('express').Router();
const fs = require('fs');
//const upload = multer({dest:'uploads/'});
// configure the AWS SDK with your AWS access key ID, secret access key, and region
// AWS.config.update({
 
// });
//aws config
const s3 = new S3({
  region: 'ap-south-1',
  accessKeyId: 'AKIA5W7LIMQIAPEGY3LM',
  secretAccessKey: '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'
});
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
const uploadS3 = (fileData) =>{
  return new Promise((resolve, reject) => {
    const params = {
      Bucket:'bseebixuat',
      Key: `${Date.now().toString()}`,
      Body:fileData
  }
    s3.upload(params ,(err,data)=>{
      if(err){
        console.log(err);
        reject(err);
      }
      console.log(data);
      resolve(data);
    })
})
}
const uploadFiles = (req,res)=>{
  // console.log(req.files);
  // return
  if(req.files && req.files.length>0){
    for(var i = 0 ; i<req.files.length ; i++){
      console.log("")
      uploadS3(req.files[i].buffer).then((result)=>{
        console.log('file URL', result.Location);
       console.log({
          msg : `${'required'} files are uploaded successfully`
        })
    }).catch((e)=>console.log(e,"error"))
  }
}
}
      
module.exports = {uploadFiles,upload};