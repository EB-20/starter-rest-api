const router = require("express").Router();
const {
  userMyaccount,
  userData,
  uploadProfileImage,
  downloadInvoice,
  updateDetailsUserSec,
  updateDetailsUserThird,
  allUserCount,
  updateDetailsUser,
  addNominee,
  editUserData,
  addSuperAdmin,coveredNotCovered,editFamilyInfo
} = require("../controller/user.controller.postgres");
const { verifyJwtToken } = require("../../../utils/token.utils");
const multer = require("multer");

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "logoUpload/");
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "_" + Date.now() + ".jpeg");
    },
  }),
});
// const upload = multer({ storage:multer .diskStorage({
//     destination: function(req,file,cb){
//       cb(null,'profileUpload/')
//     } ,filename:function(req,file,cb){
//       cb(null,file.fieldname+"_"+Date.now()+".jpeg")
//     }
//   })
// });

router.get("/my-account", verifyJwtToken, userMyaccount);
router.get("/user-data", verifyJwtToken, userData);
router.put("/edit-user",verifyJwtToken,
  upload.single("file"),
  uploadProfileImage
);
router.get("/download-invoice", verifyJwtToken, downloadInvoice);
router.get("/all-user-count", verifyJwtToken, allUserCount);
router.get("/add-nominee", verifyJwtToken, addNominee);
router.put("/edit-user-details", verifyJwtToken, editUserData);
router.post("/add-super-admin", verifyJwtToken, addSuperAdmin);
router.put("/update-user-details", verifyJwtToken, updateDetailsUser);
router.put("/update-user-details-sec", verifyJwtToken, updateDetailsUserSec);
router.put(
  "/update-user-details-third",
  verifyJwtToken,
  updateDetailsUserThird
);
router.put(
  "/update-org-and-plan-details", verifyJwtToken, updateDetailsUser, updateDetailsUserSec,updateDetailsUserThird
);
router.get("/fetch-covered-notcovered",verifyJwtToken,coveredNotCovered)
router.put("/edit-user-family-info",verifyJwtToken,editFamilyInfo)
module.exports = router;
