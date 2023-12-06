
const userSchema =(sequelize, DataTypes) => sequelize.define(
  "user",
  {
    orgId: { type: DataTypes.INTEGER },
    superAdminId: { type: DataTypes.INTEGER },
    superAdminUniversalAccess: { type: DataTypes.BOOLEAN, defaultValue: false },
    familyId: { type: DataTypes.INTEGER },
    planId: { type: DataTypes.INTEGER },
    empId: { type: DataTypes.STRING(100) },
    phoneNoVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
    userName: { type: DataTypes.STRING },
    dob: { type: DataTypes.DATE },
    doj: { type: DataTypes.DATE },
    fatherName: { type: DataTypes.STRING },
    motherName: { type: DataTypes.STRING },
    spouseName: { type: DataTypes.STRING },
    gender: { type: DataTypes.STRING },
    addressLineOne: { type: DataTypes.STRING },
    addressLineTwo: { type: DataTypes.STRING },
    pinCode: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    userphoneNumber: { type: DataTypes.STRING ,unique: true, sparse: true},
    role: { type: DataTypes.STRING, defaultValue: "EMP" },
    permissions: { type: DataTypes.STRING, defaultValue: `['view-EMP']` },
    phoneOtp: { type: DataTypes.STRING },
    userMail: { type: DataTypes.STRING ,unique: true, sparse: true},
    mailOtp: { type: DataTypes.STRING },
    token: { type: DataTypes.STRING },
    userProfileImagePath: { type: DataTypes.STRING },
    userJourneyStatus: { type: DataTypes.STRING },
    wlsPath: { type: DataTypes.STRING },
    adminEmpUploadFirstSet: { type: DataTypes.BOOLEAN, defaultValue: false },
    userStatus: {
      type: DataTypes.STRING,
      defaultValue: "ACTIVE",
    },
    relationStatus: {
      type: DataTypes.STRING,
      defaultValue: 'SINGLE',
    },
    // spouse: { type: Object, defaultValue: null },
    // childOne: { type: DataTypes.JSON, defaultValue: null },
    // childTwo: { type: DataTypes.JSON, defaultValue: null }
  },
  { timestamps: true }
);

// userSchema.hasOne(orgs, { foreignKey: "adminId" });
// // userSchema.hasMany(planSchema, { foreignKey: "id" });
// userSchema.hasOne(family, { foreignKey: "id" });
// userSchema.hasOne(userSchema, { foreignKey: "id" });

module.exports = userSchema;
