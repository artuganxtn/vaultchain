const { dbRun, dbGet } = require('../database');
const crypto = require('crypto');
const { notifyDataChange } = require('../services/liveUpdates');

// Internal function to add notifications (imported from adminController pattern)
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

// Internal function for other controllers to use without an HTTP request
const addTransactionInternal = async (userId, transaction) => {
    const newTx = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        userId,
        ...transaction
    };
    
    // Stringify JSON fields before insert
    ['dispute', 'withdrawalDetails', 'depositDetails'].forEach(field => {
        if (newTx[field] && typeof newTx[field] === 'object') {
            newTx[field] = JSON.stringify(newTx[field]);
        }
    });
    
    const columns = Object.keys(newTx).map(k => `"${k}"`).join(', ');
    const placeholders = Object.keys(newTx).map(() => '?').join(', ');
    
    await dbRun(`INSERT INTO transactions (${columns}) VALUES (${placeholders})`, Object.values(newTx));
    notifyDataChange('transaction_created', { userId, transactionId: newTx.id, type: newTx.type });
    return newTx;
}

exports.addTransactionInternal = addTransactionInternal;

exports.addTransaction = async (req, res) => {
    const { userId, ...transaction } = req.body;
    try {
        const newTx = await addTransactionInternal(userId, transaction);
        res.status(201).json(newTx);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateTransaction = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Stringify JSON fields before update
    ['dispute', 'withdrawalDetails'].forEach(field => {
        if (updates[field]) {
            updates[field] = JSON.stringify(updates[field]);
        }
    });

    try {
        // Stringify JSON fields before update
        ['dispute', 'withdrawalDetails', 'depositDetails'].forEach(field => {
            if (updates[field]) {
                updates[field] = JSON.stringify(updates[field]);
            }
        });

        // We update the whole object, simpler than building dynamic SET clause
        await dbRun(
            `UPDATE transactions SET 
                userId = ?, recipientId = ?, date = ?, description = ?, amount = ?, originalAmount = ?, originalCurrency = ?,
                type = ?, status = ?, adminId = ?, referenceCode = ?, proofImageUrl = ?, dispute = ?, withdrawalDetails = ?, depositDetails = ?
            WHERE id = ?`,
            [
                updates.userId, updates.recipientId, updates.date, updates.description, updates.amount, updates.originalAmount, updates.originalCurrency,
                updates.type, updates.status, updates.adminId, updates.referenceCode, updates.proofImageUrl, updates.dispute, updates.withdrawalDetails, updates.depositDetails,
                id
            ]
        );
        notifyDataChange('transaction_updated', { transactionId: id, status: updates.status });
        res.status(200).json(updates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * Process internal transfer between users
 * This handles the entire transfer atomically: updates balances and creates transactions
 */
exports.processInternalTransfer = async (req, res) => {
    const { senderId, recipientId, amount, fee, feeCollectorId } = req.body;
    
    console.log('[Transfer] Request received:', { senderId, recipientId, amount, fee, feeCollectorId });
    
    if (!senderId || !recipientId || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid transfer parameters' });
    }

    try {
        // Get all users involved
        const sender = await dbGet('SELECT * FROM users WHERE id = ?', [senderId]);
        const recipient = await dbGet('SELECT * FROM users WHERE id = ?', [recipientId]);
        
        if (!sender) {
            console.error('[Transfer] Sender not found:', senderId);
            return res.status(404).json({ message: 'Sender not found' });
        }
        if (!recipient) {
            console.error('[Transfer] Recipient not found:', recipientId);
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const totalDebit = amount + (fee || 0);
        
        console.log('[Transfer] Balance check:', {
            senderBalance: sender.balance,
            totalDebit,
            sufficient: sender.balance >= totalDebit
        });
        
        // Check sufficient balance
        if (sender.balance < totalDebit) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        await dbRun('BEGIN TRANSACTION');

        try {
            // Update sender balance (deduct amount + fee)
            await dbRun('UPDATE users SET balance = balance - ? WHERE id = ?', [totalDebit, senderId]);
            console.log('[Transfer] Deducted from sender:', { senderId, amount: totalDebit });
            
            // Update recipient balance (add amount)
            await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, recipientId]);
            console.log('[Transfer] Added to recipient:', { recipientId, amount });
            
            // Update fee collector balance if fee exists
            if (fee > 0 && feeCollectorId) {
                await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [fee, feeCollectorId]);
                console.log('[Transfer] Added fee to collector:', { feeCollectorId, fee });
                // Create transaction for fee collector
                await addTransactionInternal(feeCollectorId, {
                    description: `Fee from transfer by ${sender.name}`,
                    amount: fee,
                    type: 'Admin Adjustment',
                    status: 'Completed'
                });
            }

            // Create transaction for sender (outgoing)
            const senderTx = await addTransactionInternal(senderId, {
                description: `Transfer to ${recipient.name}`,
                amount: -amount,
                type: 'Internal Transfer',
                recipientId: recipientId,
                status: 'Completed'
            });
            console.log('[Transfer] Created sender transaction:', senderTx.id);

            // Create transaction for recipient (incoming)
            // Note: recipientId is set to senderId to track the other party
            // But the transaction belongs to the recipient (userId = recipientId)
            await addTransactionInternal(recipientId, {
                description: `Transfer from ${sender.name}`,
                amount: amount,
                type: 'Internal Transfer',
                recipientId: senderId, // This tracks who sent it, but transaction belongs to recipient
                status: 'Completed'
            });
            console.log('[Transfer] Created recipient transaction');

            // Create fee transaction for sender if fee exists
            if (fee > 0) {
                await addTransactionInternal(senderId, {
                    description: 'Transfer Fee',
                    amount: -fee,
                    type: 'Penalty Fee',
                    status: 'Completed'
                });
                console.log('[Transfer] Created fee transaction');
            }

            // Create notifications for both sender and recipient
            await addNotificationInternal({
                userId: senderId,
                type: 'info',
                messageKey: 'notif_sent_money',
                messageParams: { amount: amount, name: recipient.name }
            });
            console.log('[Transfer] Created sender notification');

            await addNotificationInternal({
                userId: recipientId,
                type: 'success',
                messageKey: 'notif_received_money',
                messageParams: { amount: amount, name: sender.name }
            });
            console.log('[Transfer] Created recipient notification');

            await dbRun('COMMIT');
            console.log('[Transfer] Transfer completed successfully');
            
            res.status(200).json({
                success: true,
                transaction: senderTx,
                senderBalance: sender.balance - totalDebit,
                recipientBalance: recipient.balance + amount
            });
            notifyDataChange('internal_transfer_completed', {
                senderId,
                recipientId,
                amount,
                fee
            });
        } catch (err) {
            await dbRun('ROLLBACK');
            console.error('[Transfer] Transaction error:', err);
            throw err;
        }
    } catch (err) {
        console.error('[Transfer] Error processing transfer:', err);
        res.status(500).json({ message: err.message || 'Failed to process transfer' });
    }
};
