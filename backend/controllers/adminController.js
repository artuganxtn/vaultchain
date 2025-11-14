const { dbGet, dbRun, dbAll } = require('../database');
const { addTransactionInternal } = require('./transactionsController');

const addNotificationInternal = async (notificationData) => {
    const { userId, type, messageKey, messageParams, link } = notificationData;
    const newNotification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        userId,
        timestamp: new Date().toISOString(),
        messageKey,
        messageParams: JSON.stringify(messageParams || {}),
        type,
        isRead: false,
        link: link || null
    };
    await dbRun(
        'INSERT INTO notifications (id, userId, timestamp, messageKey, messageParams, type, isRead, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        Object.values(newNotification)
    );
    return newNotification;
};

// --- Transaction Approvals ---

exports.approveDeposit = async (req, res) => {
    try {
        const tx = await dbGet('SELECT * FROM transactions WHERE id = ? AND type = ?', [req.params.id, 'Deposit']);
        if (tx && tx.status === 'Awaiting Confirmation') {
            await dbRun('UPDATE transactions SET status = ? WHERE id = ?', ['Completed', req.params.id]);
            await dbRun('UPDATE users SET balance = balance + ?, totalDeposits = totalDeposits + ? WHERE id = ?', [tx.amount, tx.amount, tx.userId]);
            await addNotificationInternal({ userId: tx.userId, type: 'success', messageKey: 'notif_deposit_approved', messageParams: { amount: tx.amount } });
            res.status(200).json({ message: 'Deposit approved' });
        } else {
            res.status(404).json({ message: 'Transaction not found or not pending' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.rejectDeposit = async (req, res) => {
    try {
        const tx = await dbGet('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
        await dbRun('UPDATE transactions SET status = ? WHERE id = ?', ['Failed', req.params.id]);
        await addNotificationInternal({ userId: tx.userId, type: 'error', messageKey: 'notif_deposit_rejected', messageParams: { amount: tx.amount } });
        res.status(200).json({ message: 'Deposit rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.approveWithdrawal = async (req, res) => {
    try {
        await dbRun('UPDATE transactions SET status = ? WHERE id = ?', ['Completed', req.params.id]);
        res.status(200).json({ message: 'Withdrawal approved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.rejectWithdrawal = async (req, res) => {
    try {
        const tx = await dbGet('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
        if (tx) {
            await dbRun('UPDATE transactions SET status = ? WHERE id = ?', ['Failed', req.params.id]);
            // Return funds to user balance
            await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [Math.abs(tx.amount), tx.userId]);
            await addNotificationInternal({ userId: tx.userId, type: 'error', messageKey: 'notif_withdrawal_rejected', messageParams: { amount: Math.abs(tx.amount) } });
        }
        res.status(200).json({ message: 'Withdrawal rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.approveInvestmentWithdrawal = async (req, res) => {
    try {
        const tx = await dbGet('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [tx.userId]);
        if (tx && user) {
            const amountToReturn = user.invested + user.unclaimedProfit;
            await dbRun('UPDATE users SET balance = balance + ?, invested = 0, activePlanId = NULL, unclaimedProfit = 0, investmentStartDate = NULL WHERE id = ?', [amountToReturn, user.id]);
            await dbRun('UPDATE transactions SET status = ?, amount = ?, type = ? WHERE id = ?', ['Completed', amountToReturn, 'Investment Withdrawal', tx.id]);
            await addNotificationInternal({ userId: tx.userId, type: 'success', messageKey: 'notif_investment_withdrawal_approved', messageParams: { amount: amountToReturn } });
        }
        res.status(200).json({ message: 'Investment withdrawal approved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.rejectInvestmentWithdrawal = async (req, res) => {
    try {
        await dbRun('UPDATE transactions SET status = ? WHERE id = ?', ['Failed', req.params.id]);
        res.status(200).json({ message: 'Investment withdrawal rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- KYC ---

exports.approveKyc = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
        if (user && user.welcomeBonus <= 0) {
            await dbRun('UPDATE users SET status = ?, kycRejectionReason = NULL, balance = balance + 10, welcomeBonus = 10 WHERE id = ?', ['Verified', userId]);
            await addTransactionInternal(userId, { description: 'Welcome Bonus', amount: 10, type: 'Bonus', status: 'Completed' });
        } else if (user) {
            await dbRun('UPDATE users SET status = ?, kycRejectionReason = NULL WHERE id = ?', ['Verified', userId]);
        }
        res.status(200).json({ message: 'KYC approved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.rejectKyc = async (req, res) => {
    const { userId } = req.params;
    const { reason } = req.body;
    try {
        await dbRun('UPDATE users SET status = ?, kycRejectionReason = ?, kycDocuments = ? WHERE id = ?', ['Rejected', reason, '{}', userId]);
        res.status(200).json({ message: 'KYC rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// --- User Flags ---

exports.updateUserFlags = async (req, res) => {
    const { id } = req.params;
    const { isFrozen, isBanned, isFeeExempt, notification } = req.body;
    try {
        await dbRun('UPDATE users SET isFrozen = ?, isBanned = ?, isFeeExempt = ?, notification = ? WHERE id = ?', [isFrozen, isBanned, isFeeExempt, JSON.stringify(notification), id]);
        res.status(200).json({ message: 'User flags updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// --- Dispute ---
exports.resolveDispute = async (req, res) => {
    const { id } = req.params;
    const { winnerId } = req.body;
    try {
        const tx = await dbGet('SELECT * FROM transactions WHERE id = ?', [id]);
        if (!tx || !tx.dispute) return res.status(404).json({ message: 'Disputed transaction not found.' });
        
        const amount = Math.abs(tx.amount);
        const loserId = winnerId === tx.userId ? tx.recipientId : tx.userId;

        await dbRun('BEGIN TRANSACTION');
        await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, winnerId]);
        await dbRun('UPDATE users SET onHoldBalance = onHoldBalance - ? WHERE id = ?', [amount, loserId]);
        
        const dispute = JSON.parse(tx.dispute);
        dispute.status = 'Resolved';
        await dbRun('UPDATE transactions SET dispute = ? WHERE id = ?', [JSON.stringify(dispute), id]);
        await dbRun('COMMIT');

        res.status(200).json({ message: 'Dispute resolved.' });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ message: err.message });
    }
};

// --- Copy Trading ---
exports.distributeCopyTradingProfits = async (req, res) => {
    const { subscriptionIds, percentage } = req.body;
    const profitRate = parseFloat(percentage) / 100;

    if (isNaN(profitRate) || profitRate <= 0) {
        return res.status(400).json({ message: 'Invalid profit percentage' });
    }

    try {
        const subs = await dbAll(`SELECT * FROM subscriptions WHERE id IN (${subscriptionIds.map(() => '?').join(',')})`, subscriptionIds);
        const traders = await dbAll('SELECT * FROM copy_traders');
        const feeCollector = await dbGet('SELECT * FROM users WHERE id = ?', ['fee_collector']);

        await dbRun('BEGIN TRANSACTION');

        for (const sub of subs) {
            const trader = traders.find(t => t.id === sub.traderId);
            if (!trader) continue;

            const profitAmount = sub.currentValue * profitRate;
            const traderShare = profitAmount * (trader.profitShare / 100);
            const userNetProfit = profitAmount - traderShare;

            if (feeCollector) {
                await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [traderShare, feeCollector.id]);
                await addTransactionInternal(feeCollector.id, { description: `Profit share from copy trade`, amount: traderShare, type: 'Admin Adjustment', status: 'Completed' });
            }

            await dbRun('UPDATE subscriptions SET currentValue = currentValue + ?, pnl = pnl + ? WHERE id = ?', [userNetProfit, userNetProfit, sub.id]);
            await addTransactionInternal(sub.userId, { description: `Copy trading profit from ${trader.name}`, amount: userNetProfit, type: 'Copy Trading Profit', status: 'Completed' });
        }

        await dbRun('COMMIT');
        res.status(200).json({ message: 'Profits distributed successfully' });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ message: err.message });
    }
};
