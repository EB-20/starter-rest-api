const router = require('express').Router();
const { payment ,paymentSummary,paymentInvoiceDownload} = require('../controller/payment.controller.postgres');
const { verifyJwtToken } = require('../../../utils/token.utils');
const { verifyPermission } = require('../../../utils/accessVerify');

router.post('/', verifyJwtToken, payment)
router.get('/payment-summary', verifyJwtToken, paymentSummary)
router.get('/downlod-invoice', verifyJwtToken,paymentInvoiceDownload)



module.exports = router;