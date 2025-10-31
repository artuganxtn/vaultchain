const express = require('express');
const router = express.Router();
const { dbRun, dbGet } = require('../database');
const crypto = require('crypto');

// Create an audit log entry
router.post('/', async (req, res) => {
    const { adminId, action, details, targetUserId } = req.body || {};
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    try {
        await dbRun(
            `INSERT INTO audit_logs (id, timestamp, adminId, action, targetUserId, details) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, timestamp, adminId || '', action || 'UNKNOWN', targetUserId || null, details || '']
        );
        const log = await dbGet('SELECT * FROM audit_logs WHERE id = ?', [id]);
        return res.status(201).json(log);
    } catch (err) {
        console.error('Add audit log error:', err);
        return res.status(500).json({ message: 'Failed to add audit log' });
    }
});

module.exports = router;


