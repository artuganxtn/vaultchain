const express = require('express');
const router = express.Router();
const vouchersController = require('../controllers/vouchersController');

router.post('/create', vouchersController.createVaultVoucher);
router.get('/check/:code', vouchersController.checkVaultVoucher);
router.post('/redeem', vouchersController.redeemVaultVoucher);
router.post('/cancel', vouchersController.cancelVaultVoucher);

module.exports = router;
