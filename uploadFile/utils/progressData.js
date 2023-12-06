const userSchema = require("../model/user.model");
const orgSchema = require("../model/orgs.model");
const { createJwtToken } = require("./token.utils");

const progressData = async (userId) => {
  try {
    let data = {};
    const user = await userSchema.findById({ _id: userId });
    const userStatus = user.userJourneyStatus;
    const token = createJwtToken({ user: user._id, role: user.role });
    user.token = token
    user.save()
    // if (userStatus === "STEP0") {
    if (userStatus === "STEP0"){
      data = {
        status: "success",
        data: {
          token: token,
          userJourneyStatus: user.userJourneyStatus,
          role: user.role,
          adminEmpUploadFirstSet:user.adminEmpUploadFirstSet

        }
        // status: "success"
        // data: {
        //   token: token,
        //   userJourneyStatus: user.userJourneyStatus,
        //   role:user.role
        // }
      }
    }
    if (userStatus === "STEP1") {
      const org = await orgSchema.findById({ _id: user.orgId });
      data = {
        status: "success",
        data: {
          token: token,
          userJourneyStatus: user.userJourneyStatus,
          role: user.role,
          adminEmpUploadFirstSet:user.adminEmpUploadFirstSet
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
      const org = await orgSchema.findById({ _id: user.orgId });
      data = {
        status: "success",
        data: {
          token: token,
          userJourneyStatus: user.userJourneyStatus,
          role: user.role,
          adminEmpUploadFirstSet:user.adminEmpUploadFirstSet
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
            totalEmpCount: org.totalEmployee
          },
        },
      };
    }
    if (userStatus === "STEP3") {
      const org = await orgSchema.findById({ _id: user.orgId });
      data = {
        status: "success",
        data: {
          token: token,
          userJourneyStatus: user.userJourneyStatus,
          role: user.role,
          adminEmpUploadFirstSet:user.adminEmpUploadFirstSet
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
            totalPrice: (org.totalPlanPrice/12),
          },
        },
      };
    }
    if (userStatus === "DONE") {
      data = {
        status: "success",
        data: {
          token: token,
          userJourneyStatus: user.userJourneyStatus,
          role: user.role,
          adminEmpUploadFirstSet:user.adminEmpUploadFirstSet
        }
      }
    }
    return data;
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = { progressData };
