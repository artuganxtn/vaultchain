const { dbRun, dbGet } = require('../database');
const crypto = require('crypto');
const { addTransactionInternal } = require('./transactionsController');

exports.addSubscription = async (req, res) => {
    const subData = req.body;
    try {
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [subData.userId]);
        if (user.balance < subData.investedAmount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // Ensure currentValue starts equal to investedAmount (initial investment)
        const newSub = { 
            id: crypto.randomUUID(), 
            ...subData, 
            currentValue: subData.currentValue || subData.investedAmount, // Initialize currentValue = investedAmount if not provided
            pnl: subData.pnl || 0, // Initialize pnl = 0 if not provided
            settings: JSON.stringify(subData.settings) 
        };
        
        await dbRun('BEGIN TRANSACTION');
        await dbRun(
            'INSERT INTO subscriptions (id, traderId, userId, subscribedAt, unsubscribedAt, investedAmount, currentValue, pnl, isActive, settings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [newSub.id, newSub.traderId, newSub.userId, newSub.subscribedAt, newSub.unsubscribedAt || null, newSub.investedAmount, newSub.currentValue, newSub.pnl, newSub.isActive !== undefined ? newSub.isActive : true, newSub.settings]
        );
        await dbRun('UPDATE users SET balance = balance - ? WHERE id = ?', [subData.investedAmount, subData.userId]);
        await dbRun('UPDATE copy_traders SET followers = followers + 1 WHERE id = ?', [subData.traderId]);
        await addTransactionInternal(subData.userId, {
            description: `Subscribed to copy trader`,
            amount: -subData.investedAmount,
            type: 'Copy Trade Subscribe',
            status: 'Completed'
        });
        await dbRun('COMMIT');

        res.status(201).json({ ...newSub, settings: subData.settings });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ message: err.message });
    }
};

exports.updateSubscription = async (req, res) => {
    const { id } = req.params;
    const { isActive, unsubscribedAt, settings } = req.body;
    try {
        // This handles both unsubscription and settings updates
        if (isActive === false) { // Unsubscribe logic
            const sub = await dbGet('SELECT * FROM subscriptions WHERE id = ?', [id]);
            const user = await dbGet('SELECT * FROM users WHERE id = ?', [sub.userId]);

            const isEarly = new Date().getTime() - new Date(sub.subscribedAt).getTime() < 7 * 24 * 60 * 60 * 1000;
            let penalty = 0;
            if (isEarly) {
                penalty = sub.currentValue * 0.165;
            }
            const returnAmount = sub.currentValue - penalty;

            await dbRun('BEGIN TRANSACTION');
            await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [returnAmount, user.id]);
            if (penalty > 0) {
                await addTransactionInternal(user.id, { description: 'Early Unsubscribe Penalty', amount: -penalty, type: 'Penalty Fee', status: 'Completed' });
            }
            await addTransactionInternal(user.id, { description: 'Unsubscribed from copy trader', amount: returnAmount, type: 'Copy Trade Unsubscribe', status: 'Completed' });
            await dbRun('UPDATE subscriptions SET isActive = ?, unsubscribedAt = ? WHERE id = ?', [false, unsubscribedAt, id]);
            await dbRun('UPDATE copy_traders SET followers = MAX(0, followers - 1) WHERE id = ?', [sub.traderId]);
            await dbRun('COMMIT');

        } else if (settings) { // Settings update logic
            await dbRun('UPDATE subscriptions SET settings = ? WHERE id = ?', [JSON.stringify(settings), id]);
        }
        
        const updatedSub = await dbGet('SELECT * FROM subscriptions WHERE id = ?', [id]);
        res.status(200).json(updatedSub);
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ message: err.message });
    }
};
