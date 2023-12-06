// const orgSchema = require('../../../model/orgs.model');
// const userSchema = require('../../../model/user.model');
// const pinSchema = require('../../../model/pin.model');

// const saveOrgNameGst = async (req, res) => {
//    try {
//       const { companyName, companyGstNumber, partOfSEZ, addressLine1, addressLine2, pincode } = req.body;
//       if (!companyName) {
//          res.status(400).json({ status: "error", message: "Please enter company name to proceed" })
//          return;
//       }
//       if (!companyGstNumber) {
//          res
//             .status(400)
//             .json({
//                status: "error",
//                message: "Please enter company gst Number to proceed",
//             });
//          return;
//       }
//       if (!addressLine1) {
//          res
//             .status(400)
//             .json({
//                status: "error",
//                message: "Please enter adress to proceed",
//             });
//          return;
//       }
//       if (!addressLine2) {
//          res
//             .status(400)
//             .json({
//                status: "error",
//                message: "Please enter address to proceed",
//             });
//          return;
//       }
//       if (!pincode) {
//          res
//             .status(400)
//             .json({
//                status: "error",
//                message: "Please enter pincode to proceed",
//             });
//          return;
//       }
//       const user = req.user;
//       let sadmin = await userSchema.findById(user.superAdminId)
//       if(!sadmin){
//          return res.status(400).json({status:"error",message:"Super Admin not found"})
//       }
//       const stateCity = await pinSchema.findOne({ pincode: pincode })
//       if (stateCity !== null) {
//          if (user.phoneNoVerified) {
//             const orgName = await orgSchema.findOne({ orgName: companyName });
//             if (orgName) {
//                res.status(400).json({ status: "error", message: "Company name is already registered" });
//                return;
//             }
//             const org = await orgSchema.findOne({ companyGstNumber: companyGstNumber });
//             if (org) {
//                res.status(400).json({ status: "error", message: "Company gst is already registered" });
//                return;
//             }
//             const adminOrg = await orgSchema.findOne({phoneNumber:user.userphoneNumber})
//             if(!adminOrg){
//                res.status(400).json({ status: "error", message: "Signup First" });
//                return;
//             }
//              adminOrg.orgName= companyName
//              adminOrg.companyGstNumber = companyGstNumber
//              adminOrg.partOfSEZ = partOfSEZ
//              adminOrg.addressLine1=addressLine1
//              adminOrg.addressLine2 =addressLine2
//              adminOrg.city= stateCity.districtName
//              adminOrg.state= stateCity.stateName
//              adminOrg.pincode = pincode
//              adminOrg.adminId = user._id
//              adminOrg.wlsPath = sadmin.wlsPath
//             await adminOrg.save()
//             user.orgId = adminOrg._id;
//             user.userJourneyStatus = 'STEP1'
//             await user.save();
//             res.status(200).json({ status: "success", message: "Succesfully added company" });
//          }
//          else {
//             res.status(400).json({ status: "error", message: "Please verify phone number to continue" })
//          }
//       }
//       else {
//          res.status(400).json({ status: "error", message: "Invalid PIN Code" })
//       }
//    } catch (error) {
//       res.status(400).json({ status: "error", message: error.message });
//    }
// }
// const saveOrgDetails = async (req, res) => {
//    try {
//       const { userName, userMail, totalEmpCount } = req.body;
//       const user = req.user;
//       if (!userMail) {
//          res.status(400).json({ status: "error", message: "Please Enter email to proceed" })
//          return;
//       }
//       if (!userName) {
//          res.status(400).json({ status: "error", message: "Please Enter username to proceed" })
//          return;
//       }
//       if (!totalEmpCount) {
//          res.status(400).json({ status: "error", message: "Please Enter total employee count to proceed" })
//          return;
//       }
//       if (totalEmpCount < 7) {
//          res.status(400).json({ status: "error", message: "Total employees should be more than or equal to 7" })
//          return;
//       }
//       if (user.userJourneyStatus !== 'STEP1') {
//          res.status(400).json({ status: "error", message: "Please enter previous org details to proceed" });
//          return;
//       }
//       const mail = await userSchema.findOne({where:{ userMail: userMail }});
//       if (mail) {
//          res.status(400).json({ status: "error", message: "User email already exists" })
//          return;
//       }
//       const company = await orgSchema.findOne({ _id: user.orgId });
//       user.userName = userName;
//       user.userMail = userMail;
//       company.eMail = userMail;
//       user.userJourneyStatus = 'STEP2'
//       company.totalEmployee = totalEmpCount;
//       await user.save();
//       await company.save();
//       res.status(200).json({ status: "success", message: "successfully added company details" });

//    }
//    catch (error) {
//       res.status(400).json({ status: "error", message: error.message })
//    }
// }
// const orgProfile = async (req, res) => {
//  try {
//    const user = req.user;
//    if (user.role !== 'ADMIN') {
//      return res.status(401).json({ status: "error", message: "Unauthorized" })
//    }
//    else {
//       const org = await orgSchema.findById(user.orgId);
//       if (!org) {
//          res.status(401).json({ status: "error", message: "Company not registered" });
//       }
//       else {
//          if (!org.orgName || !org.companyGstNumber ||
//             !user.userMail || !user.userphoneNumber || !org.city || !org.state) {
//             res.status(400).json({ status: "error", message: "Company is not registered" })
//          }
//          else {
//             res.status(200).json({
//                status: "success", data: {
//                   organizationName: org.orgName,
//                   gstNo: org.companyGstNumber,
//                   mail: user.userMail,
//                   pincode:org.pincode,
//                   phoneNo: user.userphoneNumber,
//                   addressLine1:org.addressLine1,
//                   addressLine2:org.addressLine2,
//                   city: org.city,
//                   state: org.state
//                }
//             })
//          }
//       }

//    }
//  } catch (error) {
//    res.status(400).json({status:"error",message:error.message})
//  } 
// }

// module.exports = { saveOrgNameGst, saveOrgDetails, orgProfile };
