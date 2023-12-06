
const orgs =(sequelize, DataTypes) =>{
  const Org =  sequelize.define(
  "org",
  {
    orgName: { type: DataTypes.STRING },
    planId: { type: DataTypes.INTEGER },
    adminId: { type: DataTypes.INTEGER },
    phoneNumber: { type: DataTypes.STRING },
    eMail: { type: DataTypes.STRING },
    superAdminId: { type: DataTypes.INTEGER },
    totalEmployee: { type: DataTypes.INTEGER, sparse: true },
    userPurged: { type: DataTypes.INTEGER , sparse:true },
    companyGstNumber: { type: DataTypes.STRING, unique: true, sparse: true },
    partOfSEZ: { type: DataTypes.BOOLEAN, defaultValue: false },
    addressLine1: { type: DataTypes.STRING, defaultValue: null },
    addressLine2: { type: DataTypes.STRING, defaultValue: null },
    city: { type: DataTypes.STRING, defaultValue: null },
    empUploadFirstSet: {
      type: DataTypes.BOOLEAN,
      enum: [true, false],
      defaultValue: false,
    },
    state: { type: DataTypes.STRING, defaultValue: null },
    pincode: { type: DataTypes.STRING, defaultValue: null },
    empAgeCount: { type: DataTypes.JSONB},
    wlsPath: { type: DataTypes.STRING },
    totalPlanPrice: { type: DataTypes.INTEGER },
    userUploaded: { type: DataTypes.INTEGER, sparse: true, defaultValue: 0 },
    regStatus: { type: DataTypes.STRING, defaultValue: "NON-ACTIVE" },
    planPeriod: { type: DataTypes.STRING, defaultValue: "ANUALLY" },
    planExpiryDate: { type: DataTypes.DATE },
    planStartDate: { type: DataTypes.DATE },
    planType: { type: DataTypes.STRING },
  },
  { timestamps: true }
);
// orgs.hasOne(userSchema, { foreignKey: "orgId" });
// orgs.index({
//     orgName: "text",
//     regStatus: "text",

// })
// const org = mongoose.model('org', orgs)
// org.createIndexes()

Org.associate = models=>{
  userSchema.hasMany(sequelize.define('user'))
}
return Org; 
}
module.exports = orgs;
