const { dbGet, dbRun } = require('../database');

exports.updateCopyTrader = async (req, res) => {
    const { id } = req.params;
    const { followers, monthlyProfit, dailyProfit, weeklyProfit } = req.body;
    try {
        // Build dynamic update query based on provided fields
        const updates = [];
        const values = [];
        
        if (followers !== undefined) {
            updates.push('followers = ?');
            values.push(followers);
        }
        if (monthlyProfit !== undefined) {
            updates.push('monthlyProfit = ?');
            values.push(monthlyProfit);
        }
        if (dailyProfit !== undefined) {
            updates.push('dailyProfit = ?');
            values.push(dailyProfit);
        }
        if (weeklyProfit !== undefined) {
            updates.push('weeklyProfit = ?');
            values.push(weeklyProfit);
        }
        
        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }
        
        values.push(id);
        await dbRun(`UPDATE copy_traders SET ${updates.join(', ')} WHERE id = ?`, values);
        res.status(200).json({ message: 'Trader updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addReviewToTrader = async (req, res) => {
    const { id } = req.params;
    const newReview = req.body;
    try {
        const trader = await dbGet('SELECT reviews FROM copy_traders WHERE id = ?', [id]);
        if (trader) {
            const reviews = JSON.parse(trader.reviews || '[]');
            reviews.push(newReview);
            await dbRun('UPDATE copy_traders SET reviews = ? WHERE id = ?', [JSON.stringify(reviews), id]);
            res.status(201).json(newReview);
        } else {
            res.status(404).json({ message: 'Trader not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
