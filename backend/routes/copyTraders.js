const express = require('express');
const router = express.Router();
const { dbRun, dbGet } = require('../database');

// Update a copy trader
router.put('/:traderId', async (req, res) => {
    const traderId = req.params.traderId;
    const updateData = req.body || {};
    
    const fields = [];
    const params = [];
    
    if (typeof updateData.profitShare === 'number') {
        fields.push('profitShare = ?');
        params.push(updateData.profitShare);
    }
    if (typeof updateData.name === 'string') {
        fields.push('name = ?');
        params.push(updateData.name);
    }
    if (typeof updateData.aum === 'number') {
        fields.push('aum = ?');
        params.push(updateData.aum);
    }
    if (typeof updateData.followers === 'number') {
        fields.push('followers = ?');
        params.push(updateData.followers);
    }
    
    if (fields.length === 0) {
        return res.status(400).json({ message: 'No updatable fields provided' });
    }
    
    try {
        params.push(traderId);
        await dbRun(`UPDATE copy_traders SET ${fields.join(', ')} WHERE id = ?`, params);
        const updated = await dbGet('SELECT * FROM copy_traders WHERE id = ?', [traderId]);
        if (!updated) {
            return res.status(404).json({ message: 'Copy trader not found' });
        }
        
        // Parse JSON fields
        if (updated.performanceHistory) {
            try { updated.performanceHistory = JSON.parse(updated.performanceHistory); } catch {}
        }
        if (updated.tradeHistory) {
            try { updated.tradeHistory = JSON.parse(updated.tradeHistory); } catch {}
        }
        if (updated.reviews) {
            try { updated.reviews = JSON.parse(updated.reviews); } catch {}
        }
        
        return res.json(updated);
    } catch (err) {
        console.error('Update copy trader error:', err);
        return res.status(500).json({ message: 'Failed to update copy trader', error: err.message });
    }
});

// Add a review to a trader (minimal no-op success)
router.post('/:traderId/reviews', async (req, res) => {
    // In a full implementation, update copy_traders.reviews JSON
    return res.json(true);
});

module.exports = router;


