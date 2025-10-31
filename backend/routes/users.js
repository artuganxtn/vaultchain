const express = require('express');
const router = express.Router();
const { dbRun, dbGet } = require('../database');
const crypto = require('crypto');

// Debug middleware - log all requests to users router
router.use((req, res, next) => {
    console.log(`[Users Router] ${req.method} ${req.path} - Original: ${req.originalUrl}`);
    console.log(`[Users Router] Route stack:`, router.stack.map(r => ({
        path: r.route?.path,
        methods: r.route ? Object.keys(r.route.methods) : 'middleware'
    })));
    next();
});

// Add a transaction for a user
// IMPORTANT: This route must be defined BEFORE the PUT /:id route to avoid conflicts
router.post('/:id/transactions', async (req, res) => {
    console.log('[Users Router] POST /users/:id/transactions route hit', req.params.id, req.body);
    const userId = req.params.id;
    const tx = req.body || {};
    const id = crypto.randomUUID();
    const date = new Date().toISOString();
    
    try {
        // Verify user exists
        const user = await dbGet('SELECT id FROM users WHERE id = ?', [userId]);
        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Handle JSON fields
        const dispute = tx.dispute ? JSON.stringify(tx.dispute) : null;
        const withdrawalDetails = tx.withdrawalDetails ? JSON.stringify(tx.withdrawalDetails) : null;
        
        // Build the INSERT query with all fields that might be provided
        const fields = ['id', 'userId', 'date', 'description', 'amount', 'type', 'status'];
        const values = [id, userId, date, tx.description || '', tx.amount || 0, tx.type || 'Unknown', tx.status || 'Pending'];
        const placeholders = ['?', '?', '?', '?', '?', '?', '?'];
        
        // Add optional fields
        if (tx.recipientId !== undefined) { fields.push('recipientId'); values.push(tx.recipientId); placeholders.push('?'); }
        if (tx.referenceCode !== undefined) { fields.push('referenceCode'); values.push(tx.referenceCode); placeholders.push('?'); }
        if (tx.proofImageUrl !== undefined) { fields.push('proofImageUrl'); values.push(tx.proofImageUrl); placeholders.push('?'); }
        if (dispute !== null) { fields.push('dispute'); values.push(dispute); placeholders.push('?'); }
        if (withdrawalDetails !== null) { fields.push('withdrawalDetails'); values.push(withdrawalDetails); placeholders.push('?'); }
        if (tx.vaultVoucherCode !== undefined) { fields.push('vaultVoucherCode'); values.push(tx.vaultVoucherCode); placeholders.push('?'); }
        if (tx.originalAmount !== undefined) { fields.push('originalAmount'); values.push(tx.originalAmount); placeholders.push('?'); }
        if (tx.originalCurrency !== undefined) { fields.push('originalCurrency'); values.push(tx.originalCurrency); placeholders.push('?'); }
        if (tx.assetId !== undefined) { fields.push('assetId'); values.push(tx.assetId); placeholders.push('?'); }
        if (tx.assetQuantity !== undefined) { fields.push('assetQuantity'); values.push(tx.assetQuantity); placeholders.push('?'); }
        if (tx.assetPrice !== undefined) { fields.push('assetPrice'); values.push(tx.assetPrice); placeholders.push('?'); }
        if (tx.adminId !== undefined) { fields.push('adminId'); values.push(tx.adminId); placeholders.push('?'); }
        
        await dbRun(
            `INSERT INTO transactions (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
            values
        );
        
        const saved = await dbGet('SELECT * FROM transactions WHERE id = ?', [id]);
        if (!saved) {
            return res.status(500).json({ message: 'Failed to retrieve created transaction' });
        }
        
        // Parse JSON fields for response
        if (saved.dispute) {
            try { saved.dispute = JSON.parse(saved.dispute); } catch {}
        }
        if (saved.withdrawalDetails) {
            try { saved.withdrawalDetails = JSON.parse(saved.withdrawalDetails); } catch {}
        }
        
        return res.status(201).json(saved);
    } catch (err) {
        console.error('Add transaction error:', err);
        console.error('Error stack:', err.stack);
        console.error('Transaction data:', JSON.stringify(tx, null, 2));
        return res.status(500).json({ 
            message: 'Failed to add transaction', 
            error: err.message,
            details: err.stack
        });
    }
});

// Update user (used for KYC submission, balance updates, etc.)
router.put('/:id', async (req, res) => {
    const userId = req.params.id;
    const updateData = req.body || {};

    // Build dynamic SQL based on provided fields
    const fields = [];
    const params = [];

    // Basic fields
    if (typeof updateData.name === 'string') { fields.push('name = ?'); params.push(updateData.name); }
    if (typeof updateData.phone === 'string') { fields.push('phone = ?'); params.push(updateData.phone); }
    if (typeof updateData.country === 'string') { fields.push('country = ?'); params.push(updateData.country); }
    if (typeof updateData.address === 'string') { fields.push('address = ?'); params.push(updateData.address); }
    if (typeof updateData.status === 'string') { fields.push('status = ?'); params.push(updateData.status); }
    if (typeof updateData.kycRejectionReason === 'string') { fields.push('kycRejectionReason = ?'); params.push(updateData.kycRejectionReason); }
    if (typeof updateData.profileImage === 'string') { fields.push('profileImage = ?'); params.push(updateData.profileImage); }
    
    // JSON fields
    if (updateData.kycDocuments !== undefined) { fields.push('kycDocuments = ?'); params.push(JSON.stringify(updateData.kycDocuments)); }
    if (updateData.notification !== undefined) { fields.push('notification = ?'); params.push(JSON.stringify(updateData.notification)); }
    
    // Numeric fields
    if (typeof updateData.balance === 'number') { fields.push('balance = ?'); params.push(updateData.balance); }
    if (typeof updateData.invested === 'number') { fields.push('invested = ?'); params.push(updateData.invested); }
    if (typeof updateData.unclaimedProfit === 'number') { fields.push('unclaimedProfit = ?'); params.push(updateData.unclaimedProfit); }
    if (typeof updateData.onHoldBalance === 'number') { fields.push('onHoldBalance = ?'); params.push(updateData.onHoldBalance); }
    if (typeof updateData.isFrozen === 'boolean') { fields.push('isFrozen = ?'); params.push(updateData.isFrozen ? 1 : 0); }
    if (typeof updateData.isBanned === 'boolean') { fields.push('isBanned = ?'); params.push(updateData.isBanned ? 1 : 0); }
    if (typeof updateData.isFeeExempt === 'boolean') { fields.push('isFeeExempt = ?'); params.push(updateData.isFeeExempt ? 1 : 0); }
    if (typeof updateData.activePlanId === 'string' || updateData.activePlanId === null) { 
        fields.push('activePlanId = ?'); 
        params.push(updateData.activePlanId); 
    }
    if (typeof updateData.investmentStartDate === 'string' || updateData.investmentStartDate === undefined) {
        fields.push('investmentStartDate = ?');
        params.push(updateData.investmentStartDate || null);
    }

    // If KYC docs provided and no explicit status, default to Pending
    if (updateData.kycDocuments !== undefined && !fields.some(f => f.startsWith('status'))) {
        fields.push('status = ?');
        params.push('Pending');
    }

    if (fields.length === 0) {
        return res.status(400).json({ message: 'No updatable fields provided' });
    }

    try {
        params.push(userId);
        await dbRun(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
        const updated = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Parse JSON columns for client
        if (updated.kycDocuments) {
            try { updated.kycDocuments = JSON.parse(updated.kycDocuments); } catch {}
        }
        if (updated.referrals) {
            try { updated.referrals = JSON.parse(updated.referrals); } catch {}
        }
        if (updated.portfolio) {
            try { updated.portfolio = JSON.parse(updated.portfolio); } catch {}
        }
        if (updated.notification) {
            try { updated.notification = JSON.parse(updated.notification); } catch {}
        }
        console.log(`[Users Router] Updated user ${userId}, new balance: ${updated.balance}`);
        return res.json(updated);
    } catch (err) {
        console.error('Update user error:', err);
        console.error('Error stack:', err.stack);
        return res.status(500).json({ message: 'Failed to update user', error: err.message });
    }
});

module.exports = router;


