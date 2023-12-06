const router = require('express').Router();
const {saveEmployeeFamilyDetails,getEmpFamilyDetails,nomineeRelation,addNominee} = require('../controller/employee.controller.postgres');
const {verifyJwtToken} = require('../../../utils/token.utils');

router.post('/',verifyJwtToken,saveEmployeeFamilyDetails)
router.get('/get-user-family',verifyJwtToken,getEmpFamilyDetails)
router.get('/nominee-relation-data',verifyJwtToken,nomineeRelation)
router.get('/add-nominee',verifyJwtToken,addNominee)

module.exports = router;