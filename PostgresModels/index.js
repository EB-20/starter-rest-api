const { sequelize } = require("../connection");
const { DataTypes } = require("sequelize");
const coveredNotCovered = require("./coveredNotCovered")(sequelize, DataTypes);
const trails = require("./historyTrail")(sequelize, DataTypes);
const relationSchema = require("./Relation.model")(sequelize, DataTypes);
const coveredSchema = require("./covered.model")(sequelize, DataTypes);
const nomineeSchema = require("./nominee.model")(sequelize, DataTypes);
const notCoveredSchema = require("./notCovered.mode")(sequelize, DataTypes);
const orgs = require("./orgs.model")(sequelize, DataTypes);
const pagePermission = require("./pagePermissions.model")(sequelize, DataTypes);
const permissionSchema = require("./permissions.model")(sequelize, DataTypes);
const pin = require("./pin.model")(sequelize, DataTypes);
const roleSchema = require("./role.model")(sequelize, DataTypes);
const setting = require("./setting.model")(sequelize, DataTypes);
const userSchema = require("./user.model")(sequelize, DataTypes);
const family = require("./userFamilyDetails.model")(sequelize, DataTypes);
const userStatusSchema = require("./userStatus.postgres")(sequelize, DataTypes);
const logsSchema = require("./log.model")(sequelize, DataTypes);
const wallet = require("../Modules/Wallet/Model/Wallet.postgres")(
  sequelize,
  DataTypes
);
const complaintSchema = require("../Modules/ComplaintModule/model/plan.model.postgres")(sequelize, DataTypes);
const walletTransaction =
  require("../Modules/Wallet/Model/Transaction.postgres")(sequelize, DataTypes);
const nomineeRelation = require("./nomineeRelation.model")(
  sequelize,
  DataTypes
);
const planDetailSchema =
  require("../Modules/PlanModule/model/planDetails.postgres.model")(
    sequelize,
    DataTypes
  );
const planSchema = require("../Modules/PlanModule/model/plan.model.postgres")(
  sequelize,
  DataTypes
);
const planPriceTable =
  require("../Modules/PlanModule/model/planPrice.postgres")(
    sequelize,
    DataTypes
  );
const orderPay =
  require("../Modules/PaymentModule/model/paymentPostgres.model")(
    sequelize,
    DataTypes
  );

planSchema.hasMany(planPriceTable, { as: 'price', foreignKey: "planSchemaId" });
// userSchema.hasOne(relationSchema, { foreignKey: "id" });
// orgs.hasMany(userSchema,{foreignKey:'orgId'})

module.exports = {
  relationSchema,
  coveredSchema,
  nomineeSchema,
  nomineeRelation,
  notCoveredSchema,
  orgs,
  pagePermission,
  permissionSchema,
  pin,
  roleSchema,
  setting,
  userSchema,
  family,
  userStatusSchema,
  planSchema,
  planPriceTable,
  orderPay,
  trails,
  coveredNotCovered,
  planDetailSchema,
  wallet,
  walletTransaction,
  complaintSchema,logsSchema
};
