const { userSchema } = require("../PostgresModels");
const { orgs: orgSchema } = require("../PostgresModels");
const { createJwtToken } = require("./token.utils");

const progressData = async (userId) => {
  try {
    let data = {};
    let user = await userSchema.findOne({ where: { id: userId } });
    const userStatus = user.dataValues.userJourneyStatus;
    const token = createJwtToken({
      user: user.dataValues.id,
      role: user.dataValues.role,
    });
    user.token = token;
    user.save();
    user = user.dataValues;
    // if (userStatus === "STEP0") {
    if (userStatus === "STEP0") {
      data = {
        status: "success",
        data: {
          token: token,
          userJourneyStatus: user.userJourneyStatus,
          role: user.role,
          adminEmpUploadFirstSet: user.adminEmpUploadFirstSet,
        },
        // status: "success"
        // data: {
        //   token: token,
        //   userJourneyStatus: user.userJourneyStatus,
        //   role:user.role
        // }
      };
    }
    if (userStatus === "STEP1") {
      const { dataValues: org } = await orgSchema.findByPk(user.orgId);
      data = {
        status: "success",
        data: {
          token: token,
          userJourneyStatus: user.userJourneyStatus,
          role: user.role,
          adminEmpUploadFirstSet: user.adminEmpUploadFirstSet,
        },
        step: "1",
        stepData: {
          step1: {
            companyName: org.orgName,
            companyGstNumber: org.companyGstNumber,
            partOfSEZ: org.partOfSEZ,
            addressLine1: org.addressLine1,
            addressLine2: org.addressLine2,
            city: org.city,
            state: org.state,
            pincode: org.pincode,
          },
        },
      };
    }
    if (userStatus === "STEP2") {
      const { dataValues: org } = await orgSchema.findByPk(user.orgId);
      data = {
        status: "success",
        data: {
          token: token,
          userJourneyStatus: user.userJourneyStatus,
          role: user.role,
          adminEmpUploadFirstSet: user.adminEmpUploadFirstSet,
        },
        step: "2",
        stepData: {
          step1: {
            companyName: org.orgName,
            companyGstNumber: org.companyGstNumber,
            partOfSEZ: org.partOfSEZ,
            addressLine1: org.addressLine1,
            addressLine2: org.addressLine2,
            city: org.city,
            state: org.state,
            pincode: org.pincode,
          },
          step2: {
            userName: user.userName,
            userMail: user.userMail,
            totalEmpCount: org.totalEmployee,
          },
        },
      };
    }
    if (userStatus === "STEP3") {
      const { dataValues: org } = await orgSchema.findByPk(user.orgId);
      data = {
        status: "success",
        data: {
          token: token,
          userJourneyStatus: user.userJourneyStatus,
          role: user.role,
          adminEmpUploadFirstSet: user.adminEmpUploadFirstSet,
        },
        step: "3",
        stepData: {
          step1: {
            companyName: org.orgName,
            companyGstNumber: org.companyGstNumber,
            partOfSEZ: org.partOfSEZ,
            addressLine1: org.addressLine1,
            addressLine2: org.addressLine2,
            city: org.city,
            state: org.state,
            pincode: org.pincode,
          },
          step2: {
            userName: user.userName,
            userMail: user.userMail,
            totalEmpCount: org.totalEmployee,
          },
          step3: {
            totalEmployee: org.totalEmployee,
            totalPrice: org.totalPlanPrice / 12,
          },
        },
      };
    }
    if (userStatus === "DONE") {
      const { dataValues: org } = await orgSchema.findByPk(user.orgId);
      data = {
        status: "success",
        data: {
          token: token,
          userJourneyStatus: user.userJourneyStatus,
          role: user.role,
          adminEmpUploadFirstSet: user.adminEmpUploadFirstSet,
          userphoneNumber: user.userphoneNumber,
          userProfileImagePath: user.userProfileImagePath,
          addressLine1: org.addressLine1,
          addressLine2: org.addressLine2,
          state: org.state,
          city: org.city,
          pincode: org.pincode,
        },
      };
    }
    return data;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { progressData };
