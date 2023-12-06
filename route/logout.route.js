const router = require('express').Router();
const {logout} = require('../controller/logout.controller');
const { verifyJwtToken } = require('../utils/token.utils');

router.post('/',verifyJwtToken,logout)

module.exports = router;