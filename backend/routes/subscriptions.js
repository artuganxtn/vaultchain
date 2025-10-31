const express = require('express');
const router = express.Router();
const { dbRun, dbGet } = require('../database');
const crypto = require('crypto');

// Create subscription
router.post('/', async (req, res) => {
    const s = req.body || {};
    const id = s.id || crypto.randomUUID();
    try {
        await dbRun(
            `INSERT INTO subscriptions (id, traderId, userId, subscribedAt, unsubscribedAt, investedAmount, currentValue, pnl, isActive, settings)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, s.traderId, s.userId, s.subscribedAt || new Date().toISOString(), s.unsubscribedAt || null, s.investedAmount || 0, s.currentValue || 0, s.pnl || 0, !!s.isActive, JSON.stringify(s.settings || {})]
        );
        const saved = await dbGet('SELECT * FROM subscriptions WHERE id = ?', [id]);
        return res.status(201).json(saved);
    } catch (err) {
        console.error('Create subscription error:', err);
        return res.status(500).json({ message: 'Failed to create subscription' });
    }
});

// Update subscription
router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const s = req.body || {};
    const fields = [], params = [];
    if (typeof s.traderId === 'string') { fields.push('traderId = ?'); params.push(s.traderId); }
    if (typeof s.userId === 'string') { fields.push('userId = ?'); params.push(s.userId); }
    if (typeof s.subscribedAt === 'string') { fields.push('subscribedAt = ?'); params.push(s.subscribedAt); }
    if (typeof s.unsubscribedAt === 'string') { fields.push('unsubscribedAt = ?'); params.push(s.unsubscribedAt); }
    if (typeof s.investedAmount === 'number') { fields.push('investedAmount = ?'); params.push(s.investedAmount); }
    if (typeof s.currentValue === 'number') { fields.push('currentValue = ?'); params.push(s.currentValue); }
    if (typeof s.pnl === 'number') { fields.push('pnl = ?'); params.push(s.pnl); }
    if (typeof s.isActive === 'boolean') { fields.push('isActive = ?'); params.push(s.isActive ? 1 : 0); }
    if (s.settings !== undefined) { fields.push('settings = ?'); params.push(JSON.stringify(s.settings)); }
    if (fields.length === 0) return res.status(400).json({ message: 'No updatable fields provided' });
    try {
        params.push(id);
        await dbRun(`UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`, params);
        const saved = await dbGet('SELECT * FROM subscriptions WHERE id = ?', [id]);
        if (!saved) return res.status(404).json({ message: 'Subscription not found' });
        return res.json(saved);
    } catch (err) {
        console.error('Update subscription error:', err);
        return res.status(500).json({ message: 'Failed to update subscription' });
    }
});

module.exports = router;


