const router = require('express').Router()
const {getKey} = require('../seeder')
const {verifyJwtToken} = require('../utils/token.utils');
const {verifyPermission} = require('../utils/accessVerify');

router.get('/getKey',verifyJwtToken,verifyPermission(['view-KEY']), getKey)

module.exports= router;
