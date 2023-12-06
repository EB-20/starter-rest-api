const router = require('express').Router()
const {login,verifyLogin} = require('../controller/login.controller');

router.post('/', login)
router.post('/verify-login',verifyLogin)

module.exports= router; 
