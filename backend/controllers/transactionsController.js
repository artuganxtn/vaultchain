const { dbRun, dbGet } = require('../database');
const crypto = require('crypto');

// Internal function for other controllers to use without an HTTP request
const addTransactionInternal = async (userId, transaction) => {
    const newTx = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        userId,
        ...transaction
    };
    
    const columns = Object.keys(newTx).map(k => `"${k}"`).join(', ');
    const placeholders = Object.keys(newTx).map(() => '?').join(', ');
    
    await dbRun(`INSERT INTO transactions (${columns}) VALUES (${placeholders})`, Object.values(newTx));
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
        // We update the whole object, simpler than building dynamic SET clause
        await dbRun(
            `UPDATE transactions SET 
                userId = ?, recipientId = ?, date = ?, description = ?, amount = ?, originalAmount = ?, originalCurrency = ?,
                type = ?, status = ?, adminId = ?, referenceCode = ?, proofImageUrl = ?, dispute = ?, withdrawalDetails = ?
            WHERE id = ?`,
            [
                updates.userId, updates.recipientId, updates.date, updates.description, updates.amount, updates.originalAmount, updates.originalCurrency,
                updates.type, updates.status, updates.adminId, updates.referenceCode, updates.proofImageUrl, updates.dispute, updates.withdrawalDetails,
                id
            ]
        );
        res.status(200).json(updates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
