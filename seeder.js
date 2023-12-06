const setting = require("./model/setting.model");
const {
  rolePermissions,
  ebixSadmin,
  permissions,nomineeRelation
} = require("./seederConfig/roleAndPermissionsSeederData");
const role = require("./model/role.model");
const planDetailsSchema = require("./Modules/PlanModule/model/planDetails.model");
const planSchema = require("./Modules/PlanModule/model/plan.model");
const { planSelection, plan } = require("./seederConfig/planSelectionSeeder");
const { settings } = require("./seederConfig/settingSeeder");
const userSchema = require("./model/user.model");
const permissionSchema = require("./model/permissions.model");
const pinSchema = require('./model/pin.model')
const S3 = require("aws-sdk/clients/s3");
const nomineeRelationSchema = require('./model/nomineeRelation.model');
const coveredAndNotCoveredSchema =  require('./model/coveredNotCovered');
const coveredNotCovered = require('./seederConfig/coveredNotCovered');
const fs = require("fs") 
require("dotenv").config();

const getKey = async (req, res) => {
  try {
    const key = await setting.find({ app_auth: { $exists: true } });
    res.status(201).json({
      staus: "success",
      message: "Key fetched successfully",
      data: {
        Key: key[0].app_auth,
      },
    });
  } catch (error) {
    res.status(400).json({ status: "error", message: error });
  }
};
const permisssion = async () => {
  try {
    const checkExistingData = await permissionSchema.findOne({
      permissions: { $exists: true },
    });
    if (checkExistingData) {
      return;
    } else {
      const sampleData = permissions.map((permissions) => {
        return { ...permissions };
      });
      await permissionSchema.insertMany(sampleData);
    }
  } catch (error) {
    console.log(error, "can't initiate permission seeder");
  }
};
const roleSeeder = async () => {
  try {
    const checkRole = await role.findOne({ role: { $exists: true } });
    if (checkRole) {
      return;
    }
    const sampleData = rolePermissions.map((roleAndPermissions) => {
      return { ...roleAndPermissions };
    });
    await role.insertMany(sampleData);
  } catch (error) {
    console.log(error);
  }
};
const planDetailsSchemaSeeder = async () => {
  try {
    const checkPlan = await planDetailsSchema.findOne({
      planId: { $exists: true },
    });
    if (checkPlan) {
      return;
    }
    const sampleData = planSelection.map((planSelection) => {
      return { ...planSelection };
    });
    await planDetailsSchema.insertMany(sampleData);
  } catch (error) {
    console.log(error, "Cant initiate plan details seeder");
  }
};
const settingData = async () => {
  try {
    const checkExistingData = await setting.findOne({
      app_auth: { $exists: true },
    });
    if (checkExistingData) {
      return;
    } else {
      const sampleData = settings.map((settings) => {
        return { ...settings };
      });
      await setting.insertMany(sampleData);
    }
  } catch (error) {
    console.log(error, "Cant initiate config");
  }
};
const planSchemaSeeder = async () => {
  try {
    const checkPlan = await planSchema.findOne({ planId: { $exists: true } });
    if (checkPlan) {
      return;
    }
    const data = plan.map((plan) => {
      return { ...plan };
    });
    await planSchema.insertMany(plan);
  } catch (error) {
    console.log(error, "Cant initiate plan seeder");
  }
};
const sAdminSeeder = async () => {
  try {
    const user = await userSchema.findOne({ userphoneNumber: "9999999999" });
    if (user) {
      return;
    }
    const data = ebixSadmin.map((ebixSadmin) => {
      return { ...ebixSadmin };
    });
    await userSchema.insertMany(data);
  } catch (error) {
    console.log(error, "can't initiate sAdmin seeder");
  }
};
const pincodeSeeder = async () => {
  try {
    const filePath = "EB/pincode/pincodes_master.json"
    let s3 = new S3({
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY,
      region: process.env.REGION,
    });
    let pinData
    let paramsUpload = {
      Bucket: process.env.BUCKET,
      Key: "pincodes_master.json",
      Body: filePath,
    }
    let paramsGet = {
      Bucket: process.env.BUCKET,
      Key: "pincodes_master.json"
    };
    const checkPinExists = await pinSchema.findOne({ pincode: { $exists: true } })
    s3.getObject(paramsGet, function (err, data) {
      if (err) {
        if (err.code === "NoSuchKey") {
          s3.upload(paramsUpload, (err, data) => {
            if (err) {
              console.log(err);
            }
          })
        }
      }
      else {
        if (checkPinExists) {
          return;
        }
        else {
          pinData = JSON.parse(new Buffer.from(data.Body).toString("utf8"))
          pinSchema.insertMany(pinData)
        }
      }
    })
  } catch (error) {
    console.log(error, "Can't Initiate Pin Seeder");
  }
}
const defaultWLSseeder = async()=>{
  try {
    let filePath = "EB/defaultWLS/data.json"
    let s3 = new S3({
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY, 
      region: process.env.REGION,
    });
    let paramsUpload = {
      Bucket: process.env.BUCKET,
      Key: filePath,
      Body: "data.json",
    }
    let paramsGet = {
      Bucket: process.env.BUCKET,
      Key: filePath
    };
    s3.getObject(paramsGet,async function (err, data) {
      if (err) {
        if (err.code === "NoSuchKey") {
          s3.upload(paramsUpload, (err, data) => {
            if (err) {
              console.log(err);
            }
          })
        }
      }
      else{
        let jsonWls = JSON.parse(new Buffer.from(data.Body).toString("utf8"))
        let sadmin = await userSchema.findOne({role:"SADMIN"})
        var obj = {};
        obj = jsonWls
        let json = JSON.stringify(obj);
        fs.writeFileSync("data.json",json,async (err)=>{
          if(err){
            console.log(err);
          }
        })
        if(!sadmin){
          console.log("No Super Admin found");
        }
        else{
          if(!sadmin.wlsPath){
            sadmin.wlsPath = filePath
            await sadmin.save()
          }
          else{
            return;
          }
        }
     }
    })
  } catch (error) {
    console.log(error, "Can't Initiate WLS Seeder");
  }
}
const nomineeRelationData = async () => {
  try {
    const checkExistingNomineeRelationData = await nomineeRelationSchema.findOne({
      name: { $exists: true },
    });
    if (checkExistingNomineeRelationData) {
      return;
    } else { 
      const sampleData = nomineeRelation.map((nomineeRelation) => {
        return { ...nomineeRelation };
      });
      await nomineeRelationSchema.insertMany(sampleData);
    }
  } catch (error) {
    console.log(error, "Cant initiate config");
  }
};
const coveredAndNotCovered = async()=>{
  try {
    const checkExistingCoveredNotCovered = await coveredAndNotCoveredSchema.findOne({
      coveredNotCovered: { $exists: true },
    });
    if(checkExistingCoveredNotCovered){
      return;
    }
    else{
      const newData = new coveredAndNotCoveredSchema(coveredNotCovered)
      await newData.save()
    }
  } catch (error) {
    console.log(error, "Cant initiate covered not covered seeder");
  }
}
const runSeeder = async () => {
  await permisssion()
  await roleSeeder()
  await planSchemaSeeder()
  await settingData()
  await planDetailsSchemaSeeder()
  await sAdminSeeder()
  await pincodeSeeder()
  await defaultWLSseeder()
  await nomineeRelationData()
  await coveredAndNotCovered()
}


module.exports = { getKey, roleSeeder, planSchemaSeeder, 
  planDetailsSchemaSeeder, settingData, sAdminSeeder, permisssion, 
  runSeeder,defaultWLSseeder }
