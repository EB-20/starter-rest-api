const router = require('express').Router();
const {ageCountPlan,fetchPlanDetails,setPlan} = require('../controller/plan.controller.postgres');
const {verifyJwtToken} = require('../../../utils/token.utils');
const {verifyPermission} = require('../../../utils/accessVerify');
const {fetchCoveredNotCovered} = require('../controller/plan.controller')

router.post('/age-plan-count',verifyJwtToken,verifyPermission(['view-PLANPRICEORG']),ageCountPlan);
router.get('/fetch-plan-details',fetchPlanDetails);
router.get('/fetch-covered-notcovered',fetchCoveredNotCovered);


module.exports = router;