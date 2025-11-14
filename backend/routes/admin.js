const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Transaction Approvals
router.post('/approve-deposit/:id', adminController.approveDeposit);
router.post('/reject-deposit/:id', adminController.rejectDeposit);
router.post('/approve-withdrawal/:id', adminController.approveWithdrawal);
router.post('/reject-withdrawal/:id', adminController.rejectWithdrawal);
router.post('/approve-investment-withdrawal/:id', adminController.approveInvestmentWithdrawal);
router.post('/reject-investment-withdrawal/:id', adminController.rejectInvestmentWithdrawal);

// KYC
router.post('/approve-kyc/:userId', adminController.approveKyc);
router.post('/reject-kyc/:userId', adminController.rejectKyc);

// User Actions (these are specific admin actions on a user)
router.put('/user/:id', adminController.updateUserFlags); // for freeze, ban, fee exemption

// Dispute
router.post('/resolve-dispute/:id', adminController.resolveDispute);

// Copy Trading
router.post('/distribute-profits', adminController.distributeCopyTradingProfits);

module.exports = router;
