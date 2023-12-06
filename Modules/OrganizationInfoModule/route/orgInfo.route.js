const router = require('express').Router();
const {saveOrgNameGst,saveOrgDetails,orgProfile} = require('../controller/OrginfoController.postgres');
const {verifyJwtToken} = require('../../../utils/token.utils');
const {verifyPermission} = require('../../../utils/accessVerify');

router.post('/save-org-gst',verifyJwtToken,saveOrgNameGst);
router.post('/save-org-info',verifyJwtToken,saveOrgDetails);
router.get('/org-profile',verifyJwtToken,orgProfile)


module.exports= router;