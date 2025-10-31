const express = require('express');
const router = express.Router();
const { dbRun } = require('../database');
const crypto = require('crypto');

// Create admin user (minimal)
router.post('/', async (req, res) => {
    const { fullName, email, password, permissions } = req.body || {};
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    try {
        await dbRun(
            `INSERT INTO users (id, name, username, phone, email, password, role, status, balance, onHoldBalance, invested, welcomeBonus, createdAt, walletAddress, accountNumber, country, lastActive, permissions, referralCode, referrals, isAgent, referralBonus, totalDeposits, depositBonusUsed, activePlanId, unclaimedProfit, agentLevel, portfolio, isFeeExempt)
             VALUES (?, ?, ?, ?, ?, ?, 'ADMIN', 'Verified', 0, 0, 0, 0, ?, ?, ?, ?, ?, ?, ?, '[]', 0, 0, 0, NULL, 0, 0, '[]', 1)`,
            [id, fullName || 'Admin', email?.split('@')[0] || `admin_${Date.now()}`, '', email, password || 'admin123', now, crypto.randomUUID(), String(Math.floor(Math.random()*1e8)), '', now, JSON.stringify(permissions || { canManageUsers: true })]
        );
        return res.status(201).json({ id, email, role: 'ADMIN' });
    } catch (err) {
        console.error('Create admin error:', err);
        return res.status(500).json({ message: 'Failed to create admin' });
    }
});

module.exports = router;


