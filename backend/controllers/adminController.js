const { dbGet, dbRun, dbAll } = require('../database');
const { addTransactionInternal } = require('./transactionsController');
const { notifyDataChange } = require('../services/liveUpdates');

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
            notifyDataChange('deposit_approved', { transactionId: tx.id, userId: tx.userId });
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
        notifyDataChange('deposit_rejected', { transactionId: tx.id, userId: tx.userId });
        res.status(200).json({ message: 'Deposit rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.approveWithdrawal = async (req, res) => {
    try {
        const tx = await dbGet('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
        if (!tx) {
            return res.status(404).json({ message: 'Withdrawal request not found' });
        }

        if (tx.status === 'Completed') {
            return res.status(400).json({ message: 'Withdrawal already processed' });
        }

        const amountToDeduct = Math.abs(tx.amount || 0);
        if (amountToDeduct === 0) {
            return res.status(400).json({ message: 'Withdrawal amount is invalid' });
        }

        const user = await dbGet('SELECT id, balance FROM users WHERE id = ?', [tx.userId]);
        if (!user) {
            return res.status(404).json({ message: 'User not found for withdrawal' });
        }

        if ((user.balance || 0) < amountToDeduct) {
            return res.status(400).json({ message: 'Insufficient balance to approve withdrawal' });
        }

        let inTransaction = false;
        try {
            await dbRun('BEGIN TRANSACTION');
            inTransaction = true;

            await dbRun('UPDATE users SET balance = balance - ? WHERE id = ?', [amountToDeduct, user.id]);
            await dbRun('UPDATE transactions SET status = ? WHERE id = ?', ['Completed', tx.id]);

            await dbRun('COMMIT');
            inTransaction = false;
        } catch (err) {
            if (inTransaction) {
                await dbRun('ROLLBACK');
            }
            throw err;
        }

        await addNotificationInternal({ userId: tx.userId, type: 'success', messageKey: 'notif_withdrawal_approved', messageParams: { amount: amountToDeduct } });
        notifyDataChange('withdrawal_completed', { transactionId: tx.id, userId: tx.userId, amount: amountToDeduct });

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
        notifyDataChange('withdrawal_rejected', { transactionId: req.params.id, userId: tx?.userId });
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
            notifyDataChange('investment_withdrawal_approved', { transactionId: tx.id, userId: tx.userId });
        }
        res.status(200).json({ message: 'Investment withdrawal approved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.rejectInvestmentWithdrawal = async (req, res) => {
    try {
        await dbRun('UPDATE transactions SET status = ? WHERE id = ?', ['Failed', req.params.id]);
        notifyDataChange('investment_withdrawal_rejected', { transactionId: req.params.id });
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
        notifyDataChange('kyc_approved', { userId });
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
        notifyDataChange('kyc_rejected', { userId });
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
        notifyDataChange('user_flags_updated', { userId: id });
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

        notifyDataChange('dispute_resolved', { transactionId: id, winnerId });
        res.status(200).json({ message: 'Dispute resolved.' });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ message: err.message });
    }
};

// --- Copy Trading ---
exports.distributeCopyTradingProfits = async (req, res) => {
    const { subscriptionIds, percentage } = req.body;
    
    console.log('[Copy Trading Profit] Request received:', { subscriptionIds, percentage });
    
    if (!subscriptionIds || !Array.isArray(subscriptionIds) || subscriptionIds.length === 0) {
        return res.status(400).json({ message: 'No subscriptions selected' });
    }
    
    const profitRate = parseFloat(percentage) / 100;

    if (isNaN(profitRate) || profitRate <= 0) {
        return res.status(400).json({ message: 'Invalid profit percentage' });
    }

    try {
        const subs = await dbAll(`SELECT * FROM subscriptions WHERE id IN (${subscriptionIds.map(() => '?').join(',')})`, subscriptionIds);
        console.log('[Copy Trading Profit] Found subscriptions:', subs?.length || 0);
        
        if (!subs || subs.length === 0) {
            return res.status(404).json({ message: 'No subscriptions found' });
        }
        
        const traders = await dbAll('SELECT * FROM copy_traders');
        const feeCollector = await dbGet('SELECT * FROM users WHERE id = ?', ['fee_collector']);

        if (!feeCollector) {
            console.warn('[Copy Trading Profit] Fee collector account not found');
        }

        await dbRun('BEGIN TRANSACTION');

        let totalDistributed = 0;
        for (const sub of subs) {
            const trader = traders.find(t => t.id === sub.traderId);
            if (!trader) {
                console.warn(`[Copy Trading Profit] Trader not found for subscription ${sub.id}`);
                continue;
            }

            // Calculate profit based on investedAmount, not currentValue
            // This ensures profit is calculated correctly even if currentValue is 0
            const profitAmount = sub.investedAmount * profitRate;
            const traderShare = profitAmount * (trader.profitShare / 100);
            const userNetProfit = profitAmount - traderShare;

            console.log(`[Copy Trading Profit] Processing subscription ${sub.id}:`, {
                investedAmount: sub.investedAmount,
                profitRate,
                profitAmount,
                traderShare,
                userNetProfit
            });

            // Update fee collector balance (trader share)
            if (feeCollector && traderShare > 0) {
                await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [traderShare, feeCollector.id]);
                await addTransactionInternal(feeCollector.id, { description: `Profit share from copy trade`, amount: traderShare, type: 'Admin Adjustment', status: 'Completed' });
            }

            // Update subscription values (currentValue and pnl)
            await dbRun('UPDATE subscriptions SET currentValue = currentValue + ?, pnl = pnl + ? WHERE id = ?', [userNetProfit, userNetProfit, sub.id]);
            
            // CRITICAL: Add profit to user's actual balance so they can use/withdraw it
            await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [userNetProfit, sub.userId]);
            
            // Create transaction record for the user
            await addTransactionInternal(sub.userId, { description: `Copy trading profit from ${trader.name}`, amount: userNetProfit, type: 'Copy Trading Profit', status: 'Completed' });
            
            totalDistributed += userNetProfit;
        }

        await dbRun('COMMIT');
        console.log('[Copy Trading Profit] Successfully distributed:', { totalDistributed, count: subs.length });
        notifyDataChange('copy_trading_profit_distributed', { count: subs.length, totalDistributed });
        res.status(200).json({ message: 'Profits distributed successfully', totalDistributed, count: subs.length });
    } catch (err) {
        await dbRun('ROLLBACK');
        console.error('[Copy Trading Profit] Error:', err);
        res.status(500).json({ message: err.message || 'Failed to distribute profits' });
    }
};
