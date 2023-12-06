const router = require("express").Router();
const {
  complaint
} = require("../controller/complaint.controller.postgresql");
const multer = require("multer");
const { verifyJwtToken } = require("../../../utils/token.utils");
const { verifyPermission } = require("../../../utils/accessVerify");

const upload = multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, "complaintupload/");
      },
      filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + ".jpeg");
      },
    }),
  });

router.post("/",verifyJwtToken,upload.single("file"),complaint)

module.exports = router;