const express = require('express');
const router = express.Router();
const { sendPasswordResetOTP } = require('../services/emailService');

// Test endpoint to verify email sending works
router.post('/test-email', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email is required' });
    }
    
    try {
        const testOTP = '123456';
        console.log(`\n[Test Email] ========================================`);
        console.log(`[Test Email] Testing email sending to: ${email}`);
        console.log(`[Test Email] ========================================\n`);
        
        const result = await sendPasswordResetOTP(email, testOTP, 'en');
        
        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Test email sent successfully',
                messageId: result.messageId 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error,
                code: result.code
            });
        }
    } catch (error) {
        console.error('[Test Email] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

