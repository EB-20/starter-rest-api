const {
  rolePermissions,
  ebixSadmin,
  permissions,
  nomineeRelation,
} = require("./seederConfig/roleAndPermissionsSeederData");
const {
  notCoveredSchema,
  coveredSchema,
  userStatusSchema,
  relationSchema,
  pagePermission,
  planPriceTable,
  nomineeSchema: nomineeRelationSchema,
  pin: pinSchema,
  permissionSchema,
  userSchema,
  roleSchema: role,
  planDetailSchema: planDetailsSchema,
  setting,
  planSchema,
  coveredNotCovered:coveredAndNotCoveredSchema
} = require("./PostgresModels");
const coveredNotCovered = require('./seederConfig/coveredNotCovered');
const { planSelection, plan } = require("./seederConfig/planSelectionSeeder");
const { settings } = require("./seederConfig/settingSeeder");
const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");
require("dotenv").config();

const getKey = async (req, res) => {
  try {
    const key = await setting.findAll({ where: { id: 1 } });
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
    const dataValues = await permissionSchema.findOne({
      where: {
        id: 1,
      },
    });
    if (dataValues) {
      return;
    } else {
      const sampleData1 = permissions[0].permissions.map((permissions) => {
  
        return { permissions :JSON.stringify(permissions) };
      });
      const sampleData2 = permissions[0].pagePermissions.map(
        (pagePermissions) => {
          return { pagePermissions:JSON.stringify(pagePermissions)  };
        }
      );
      await permissionSchema.bulkCreate(sampleData1);
      await pagePermission.bulkCreate(sampleData2);
    }
  } catch (error) {
    console.log(error, "can't initiate permission seeder");
  }
};
const roleSeeder = async () => {
  try {
    const checkRole = await role.findOne({ where: { id: 1 } });
    // console.log(checkRole);
    if (checkRole) {
      return;
    }
    for (let i = 0; i < rolePermissions.length; i++) {}
    const sampleData = rolePermissions.map((roleAndPermissions) => {
      return { ...roleAndPermissions };
    });
    await role.bulkCreate(sampleData);
  } catch (error) {
    console.log(error);
  }
};
const planDetailsSchemaSeeder = async () => {
  try {
    const checkPlan = await planDetailsSchema.findOne({
      where: {
        id: 1,
      },
    });
    if (checkPlan) {
      return;
    }
    const sampleData = planSelection.map((planSelection) => {
      return { ...planSelection };
    });
    // await planDetailsSchema.bulkCreate(sampleData);
  } catch (error) {
    console.log(error, "Cant initiate plan details seeder");
  }
};
const settingData = async () => {
  try {
    const checkExistingData = await setting.findOne({
      where: {
        id: 1,
      },
    });
    if (checkExistingData) {
      return;
    } else {
      const sampleData = settings.map((settings) => {
        return { ...settings };
      });
      await setting.bulkCreate(sampleData);
    }
  } catch (error) {
    console.log(error, "Cant initiate config");
  }
};
const planSchemaSeeder = async () => {
  try {
    const plandata = await planSchema.findOne({ where: { id: 1 } });

    if (plandata) {
      return;
    }
    for (let i = 0; i < plan.length; i++) {
      const planPrice = [...plan[i].planPrice];
      const data = plan[i];
      delete data.planPrice;
      const { dataValues } = await planSchema.create(data);
      await planPriceTable.bulkCreate(
        planPrice.map((items) => {
          return { ...items, planSchemaId: dataValues?.id };
        })
      );
    }
  } catch (error) {
    console.log(error, "Cant initiate plan seeder");
  }
};
const userRelation = async () => {
  const relation = await relationSchema.findOne({ where: { id: 1 } });
  // console.log(relation);
  if (!relation) {
    await relationSchema.bulkCreate([
      { relation: "SINGLE" },
      { relation: "MARRIED" },
      { relation: "DIVORCED" },
      { relation: "WIDOWED" },
    ]);
  }
};
const userStatus = async () => {
  const relation = await userStatusSchema.findOne({ where: { id: 1 } });
  // console.log(relation);
  if (!relation) {
    await userStatusSchema.bulkCreate([
      { status: "ACTIVE" },
      { status: "INACTIVE" },
      { status: "PURGED" },
      { status: "ARCHIVED" },
    ]);
  }
};
const sAdminSeeder = async () => {
  try {
    const dataValues = await userSchema.findOne({
      where: { userphoneNumber: "9999999999" },
    });
    if (dataValues) {
      return;
    }
    const data = ebixSadmin.map((ebixSadmin) => {
      return { ...ebixSadmin };
    });
    await userSchema.bulkCreate(data);
  } catch (error) {
    console.log(error, "can't initiate sAdmin seeder");
  }
};
const pincodeSeeder = async () => {
  try {
    const filePath = "EB/pincode/pincodes_master.json";
    let s3 = new S3({
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY,
      region: process.env.REGION,
    });
    let pinData;
    let paramsUpload = {
      Bucket: process.env.BUCKET,
      Key: "pincodes_master.json",
      Body: filePath,
    };
    let paramsGet = {
      Bucket: process.env.BUCKET,
      Key: "pincodes_master.json",
    };
    const checkPinExists = await pinSchema.findOne({ where: { id: 1 } });
    s3.getObject(paramsGet, function (err, data) {
      if (err) {
        if (err.code === "NoSuchKey") {
          s3.upload(paramsUpload, (err, data) => {
            if (err) {
              console.log(err);
            }
          });
        }
      } else {
        if (checkPinExists) {
          return;
        } else {
          pinData = JSON.parse(new Buffer.from(data.Body).toString("utf8"));
          pinSchema.bulkCreate(pinData);
        }
      }
    });
  } catch (error) {
    console.log(error, "Can't Initiate Pin Seeder");
  }
};
const defaultWLSseeder = async () => {
  try {
    let filePath = "EB/defaultWLS/data.json";
    let s3 = new S3({
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY,
      region: process.env.REGION,
    });
    let paramsUpload = {
      Bucket: process.env.BUCKET,
      Key: filePath,
      Body: "data.json",
    };
    let paramsGet = {
      Bucket: process.env.BUCKET,
      Key: filePath,
    };
    s3.getObject(paramsGet, async function (err, data) {
      if (err) {
        if (err.code === "NoSuchKey") {
          s3.upload(paramsUpload, (err, data) => {
            if (err) {
              console.log(err);
            }
          });
        }
      } else {
        let jsonWls = JSON.parse(new Buffer.from(data.Body).toString("utf8"));
        let sadmin = await userSchema.findOne({ where: { role: "SADMIN" } });
        var obj = {};
        obj = jsonWls;
        let json = JSON.stringify(obj);
        fs.writeFileSync("data.json", json, async (err) => {
          if (err) {
            console.log(err);
          }
        });
        if (!sadmin) {
          console.log("No Super Admin found");
        } else {
          if (!sadmin.wlsPath) {
            await userSchema.update(
              { wlsPath: filePath },
              {
                where: {
                  id: sadmin.id,
                },
              }
            );
          } else {
            return;
          }
        }
      }
    });
  } catch (error) {
    console.log(error, "Can't Initiate WLS Seeder");
  }
};
const nomineeRelationData = async () => {
  try {
    const checkExistingNomineeRelationData =
      await nomineeRelationSchema.findOne({
        where: {
          id: 1,
        },
      });
    if (checkExistingNomineeRelationData) {
      return;
    } else {
      const sampleData = nomineeRelation.map((nomineeRelation) => {
        return { ...nomineeRelation };
      });
      await nomineeRelationSchema.bulkCreate(sampleData);
    }
  } catch (error) {
    console.log(error, "Cant initiate config");
  }
};
const coveredAndNotCovered = async () => {
  try {
    // console.log(
    //   coveredNotCovered.coveredNotCovered.covered.map((covered) => {
    //     return { covered };
    //   })
    // );

    const checkExistingCoveredNotCovered = await notCoveredSchema.findOne({
      where: {
        id: 1,
      },
    });
    if (checkExistingCoveredNotCovered) {
      return;
    } else {
      await coveredSchema.bulkCreate(
        coveredNotCovered.coveredNotCovered.covered.map((covered) => {
          return { covered };
        })
      );
      await notCoveredSchema.bulkCreate(
        coveredNotCovered.coveredNotCovered.notCovered.map((notCovered) => {
          return { notCovered };
        })
      );
    }
  } catch (error) {
    console.log(error, "Cant initiate covered not covered seeder");
  }
};
const runPostgresSeeder = async () => {
  await userRelation();
  await userStatus();
  await permisssion();
  await roleSeeder();
  await planSchemaSeeder();
  await settingData();
  // await planDetailsSchemaSeeder()
  await sAdminSeeder();
  await pincodeSeeder();
  await defaultWLSseeder();
  await nomineeRelationData();
  await coveredAndNotCovered();
};

module.exports = {
  getKey,
  roleSeeder,
  planSchemaSeeder,
  planDetailsSchemaSeeder,
  settingData,
  sAdminSeeder,
  permisssion,
  runPostgresSeeder,
  defaultWLSseeder,
  userRelation,
};
