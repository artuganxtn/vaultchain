const express = require('express');
const router = express.Router();
const { dbRun, dbGet, dbAll } = require('../database');
const crypto = require('crypto');

// Add a transaction for a user
router.post('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const tx = req.body || {};
    const id = crypto.randomUUID();
    const date = new Date().toISOString();
    try {
        await dbRun(
            `INSERT INTO transactions (id, userId, date, description, amount, type, status, recipientId, referenceCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, date, tx.description || '', tx.amount || 0, tx.type || 'Unknown', tx.status || 'Pending', tx.recipientId || null, tx.referenceCode || null]
        );
        const saved = await dbGet('SELECT * FROM transactions WHERE id = ?', [id]);
        return res.status(201).json(saved);
    } catch (err) {
        console.error('Add transaction error:', err);
        return res.status(500).json({ message: 'Failed to add transaction' });
    }
});

// Approve a deposit
router.post('/:transactionId/approve-deposit', async (req, res) => {
    const transactionId = req.params.transactionId;
    try {
        // Get the transaction first
        const transaction = await dbGet('SELECT * FROM transactions WHERE id = ?', [transactionId]);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const userId = transaction.userId;
        const depositAmount = transaction.amount || 0;
        const isAlreadyCompleted = transaction.status === 'Completed';

        // Update transaction status if not already completed
        if (!isAlreadyCompleted) {
            await dbRun(`UPDATE transactions SET status = ? WHERE id = ?`, ['Completed', transactionId]);
        }

        // Update user balance - add the deposit amount (even if already completed, in case balance wasn't updated before)
        if (depositAmount > 0) {
            // Get current user balance to check if this deposit was already applied
            const user = await dbGet('SELECT balance, totalDeposits FROM users WHERE id = ?', [userId]);
            if (user) {
                // Calculate what balance should be based on completed deposits
                const allCompletedDeposits = await dbAll(
                    `SELECT SUM(amount) as total FROM transactions WHERE userId = ? AND type = 'Deposit' AND status = 'Completed'`,
                    [userId]
                );
                const totalDepositsAmount = allCompletedDeposits[0]?.total || 0;
                
                // Get all bonus transactions
                const allBonuses = await dbAll(
                    `SELECT SUM(amount) as total FROM transactions WHERE userId = ? AND type = 'Bonus' AND status = 'Completed'`,
                    [userId]
                );
                const totalBonuses = allBonuses[0]?.total || 0;
                
                // Get all deductions (withdrawals, investments, fees with negative amounts)
                const allDeductions = await dbAll(
                    `SELECT SUM(ABS(amount)) as total FROM transactions WHERE userId = ? AND amount < 0 AND status = 'Completed' AND type IN ('Withdrawal', 'Investment', 'Penalty Fee', 'Internal Transfer')`,
                    [userId]
                );
                const totalDeductions = allDeductions[0]?.total || 0;
                
                // Get all additions (other positive transactions)
                const allAdditions = await dbAll(
                    `SELECT SUM(amount) as total FROM transactions WHERE userId = ? AND amount > 0 AND status = 'Completed' AND type IN ('Profit', 'Copy Trading Profit', 'Internal Transfer', 'Vault Voucher Redeem', 'Admin Adjustment')`,
                    [userId]
                );
                const totalAdditions = allAdditions[0]?.total || 0;
                
                // Calculate expected balance
                const expectedBalance = totalDepositsAmount + totalBonuses + totalAdditions - totalDeductions;
                
                // Update balance to expected value if it doesn't match
                if (Math.abs(user.balance - expectedBalance) > 0.01) {
                    console.log(`[Approve Deposit] Fixing balance for user ${userId}: ${user.balance} -> ${expectedBalance}`);
                    await dbRun(
                        `UPDATE users SET balance = ?, totalDeposits = ? WHERE id = ?`,
                        [expectedBalance, totalDepositsAmount, userId]
                    );
                } else {
                    // Just update totalDeposits if balance is correct
                    await dbRun(
                        `UPDATE users SET totalDeposits = ? WHERE id = ?`,
                        [totalDepositsAmount, userId]
                    );
                }
            }
        }

        return res.json(true);
    } catch (err) {
        console.error('Approve deposit error:', err);
        console.error('Error stack:', err.stack);
        return res.status(500).json({ message: 'Failed to approve deposit', error: err.message });
    }
});

// Update a transaction
router.put('/:transactionId', async (req, res) => {
    const transactionId = req.params.transactionId;
    const { description, amount, status, referenceCode } = req.body || {};

    const fields = [], params = [];
    if (typeof description === 'string') { fields.push('description = ?'); params.push(description); }
    if (typeof amount === 'number') { fields.push('amount = ?'); params.push(amount); }
    if (typeof status === 'string') { fields.push('status = ?'); params.push(status); }
    if (typeof referenceCode === 'string') { fields.push('referenceCode = ?'); params.push(referenceCode); }
    if (fields.length === 0) return res.status(400).json({ message: 'No updatable fields provided' });

    try {
        params.push(transactionId);
        await dbRun(`UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`, params);
        const updated = await dbGet('SELECT * FROM transactions WHERE id = ?', [transactionId]);
        if (!updated) return res.status(404).json({ message: 'Transaction not found' });
        return res.json(updated);
    } catch (err) {
        console.error('Update transaction error:', err);
        return res.status(500).json({ message: 'Failed to update transaction' });
    }
});

module.exports = router;


