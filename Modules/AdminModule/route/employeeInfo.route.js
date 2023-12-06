const router = require("express").Router();
const {
  empUpload,
  viewTransaction,
  adminEmpStatus,
  addNewEmployee,
  addEmpViaForm
} = require("../controller/employeeInfo.controller.postgresql");
const multer = require("multer");
const { verifyJwtToken } = require("../../../utils/token.utils");
const { verifyPermission } = require("../../../utils/accessVerify");

const upload = multer({ dest: "uploads/" });
router.post(
  "/emp-upload",
  verifyJwtToken,
  verifyPermission(["add-EMP"]),
  upload.single("file"),
  empUpload
);
router.post("/view-transaction", verifyJwtToken, viewTransaction);
router.get("/admin-emp-status", verifyJwtToken, adminEmpStatus);
router.post("/add-new-employee", verifyJwtToken, addNewEmployee);
router.post("/add-emp-form",verifyJwtToken,addEmpViaForm)

module.exports = router;
