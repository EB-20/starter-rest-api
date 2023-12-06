const router = require("express").Router();
const {
  allOrgDetails,
  getInvoiceDetails,
  orgEmpDetails,
  userDetails,
  adminRegForm,
  setPlan,
  fetchFile,fetchSuperAdminDetails,
  getPlanById,
  sadminFetchPlan,addNewPlan,fetchOrgsWithPlan,updatePlan,fetchUserInfo,changeUserStatus
  ,changeOrgStatus,fetchRolesAndPermissions,setSuperAdminStatus,fetchSuperAdminOrgs,sadminFetchOrgWithPlan,sadminFetchUsersWithOrg
} = require("../controller/sadmin.controller.postgres");
const multer = require('multer');
const { verifyJwtToken } = require("../../../utils/token.utils");
const { verifyPermission } = require("../../../utils/accessVerify");
const upload = multer({ storage:multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,'logoUpload/')
  } ,filename:function(req,file,cb){
    cb(null,file.fieldname+"_"+Date.now()+".jpeg")
  }
})
});

router.get("/all-org-details", verifyJwtToken, allOrgDetails);
router.get("/org-emp-details", verifyJwtToken, orgEmpDetails);
router.get("/invoice-details",verifyJwtToken,verifyPermission("SADMIN"),getInvoiceDetails);
router.post("/user-details", verifyJwtToken, userDetails);
router.post("/admin-reg-form",verifyJwtToken, adminRegForm);
router.get("/sadmin-fetch-plan",verifyJwtToken, sadminFetchPlan);
router.post("/sadmin-add-plan",verifyJwtToken, upload.single('file'),addNewPlan);
router.get("/fetch-plan",verifyJwtToken,fetchOrgsWithPlan);
router.post('/set-plan',verifyJwtToken,setPlan);
router.get('/fetch-file',fetchFile);
router.get('/fetch-user-profile',verifyJwtToken,fetchUserInfo);
router.put('/user-status',verifyJwtToken,changeUserStatus);
router.put('/org-status',verifyJwtToken,changeOrgStatus);
router.put('/update-plan',verifyJwtToken,upload.single('file'),updatePlan);
router.get('/fetch-role-permission',verifyJwtToken,fetchRolesAndPermissions);
router.get('/fetch-super-admin-details',verifyJwtToken,fetchSuperAdminDetails);
router.put('/set-super-admin-status',verifyJwtToken,setSuperAdminStatus);
router.get('/fetch-sadmin-orgs',verifyJwtToken,fetchSuperAdminOrgs);
router.get('/fetch-sadmin-orgs-with-plans',verifyJwtToken,sadminFetchOrgWithPlan);
router.get('/fetch-sadmin-users-with-plans',verifyJwtToken,sadminFetchUsersWithOrg);
router.get('/getPlanById',verifyJwtToken,getPlanById)
module.exports = router;
