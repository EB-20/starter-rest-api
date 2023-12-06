const router = require('express').Router();
const {wls,wlsGetData} = require('../Controlller/wls.controller.postgres');
const {verifyJwtToken} = require('../../../utils/token.utils');

router.post('/data',verifyJwtToken,wls)
router.get('/loadData',verifyJwtToken,wlsGetData)

module.exports = router