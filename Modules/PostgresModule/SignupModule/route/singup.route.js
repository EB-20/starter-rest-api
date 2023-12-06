const router = require('express').Router();
const {signup,verifySignup} = require('../controller/signup.controller');

router.post('/',signup)
router.post('/verify-signup',verifySignup)

module.exports= router;