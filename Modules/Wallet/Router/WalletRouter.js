const router = require("express").Router();
const { verifyJwtToken } = require("../../../utils/token.utils");
const walletController = require("../Controller/WalletController");

router.post("/addAmount", verifyJwtToken, walletController.addAmount);
router.get('/getWalletInfo',verifyJwtToken,walletController.walletInfo);
router.get('/getTransactions',verifyJwtToken,walletController.walletTransactions);
router.post('/walletTransactionsNotify',walletController.walletTransactionsNotify);
router.post('/walletTransactionsSuccess',verifyJwtToken,walletController.walletTransactionSuccess);
module.exports= router;