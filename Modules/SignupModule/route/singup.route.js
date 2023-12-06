const router = require('express').Router();
// const {signup,verifySignup} = require('../controller/signup.controller');
const {signup,verifySignup} = require('../controller/SignupController.postgres');

router.post('/',signup)
router.post('/verify-signup',verifySignup)

module.exports= router;