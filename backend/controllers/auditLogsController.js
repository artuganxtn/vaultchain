const { dbRun } = require('../database');
const crypto = require('crypto');

exports.addAuditLog = async (req, res) => {
    const { adminId, action, details, targetUserId } = req.body;
    try {
        const newLog = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            adminId,
            action,
            details,
            targetUserId: targetUserId || null
        };
        await dbRun('INSERT INTO audit_logs (id, timestamp, adminId, action, targetUserId, details) VALUES (?, ?, ?, ?, ?, ?)', Object.values(newLog));
        res.status(201).json(newLog);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
