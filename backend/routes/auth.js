const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/signup', authController.signUp);
router.post('/verify-otp', authController.verifyOTP); // Verify email OTP
router.post('/resend-otp', authController.resendOTP); // Resend verification OTP
router.post('/request-reset', authController.requestPasswordReset);
router.get('/verify-reset-token/:token', authController.verifyResetToken); // Verify token when link is clicked
router.post('/reset-password', authController.resetPasswordWithToken); // Reset password with token

module.exports = router;
