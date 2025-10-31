const express = require('express');
const router = express.Router();
const { dbGet } = require('../database');

// Get transaction by voucher code
router.get('/:code', async (req, res) => {
    const code = req.params.code;
    try {
        const tx = await dbGet('SELECT * FROM transactions WHERE referenceCode = ?', [code]);
        if (!tx) return res.status(404).json(null);
        return res.json(tx);
    } catch (err) {
        console.error('Get voucher error:', err);
        return res.status(500).json({ message: 'Failed to get voucher' });
    }
});

module.exports = router;


