const router = require('express').Router()
const {login,verifyLogin} = require('../controller/login.controller.postgres');

router.post('/', login)
router.post('/verify-login',verifyLogin)

module.exports= router; 
