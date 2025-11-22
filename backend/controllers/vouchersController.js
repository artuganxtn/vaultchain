const { dbRun, dbGet } = require('../database');
const { addTransactionInternal } = require('./transactionsController');

exports.createVaultVoucher = async (req, res) => {
    const { userId, amount } = req.body;
    try {
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user || user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        const code = `VC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        await dbRun('BEGIN TRANSACTION');
        await dbRun('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, userId]);
        await addTransactionInternal(userId, {
            description: `Vault Voucher Created`,
            amount: -amount,
            type: 'Vault Voucher Create',
            status: 'Pending',
            referenceCode: code,
        });
        await dbRun('COMMIT');

        res.status(201).json({ code });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ message: err.message });
    }
};

exports.checkVaultVoucher = async (req, res) => {
    try {
        const voucher = await dbGet("SELECT * FROM transactions WHERE referenceCode = ? AND type = 'Vault Voucher Create'", [req.params.code]);
        res.json(voucher || null);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.redeemVaultVoucher = async (req, res) => {
    const { userId, code } = req.body;
    try {
        const voucherTx = await dbGet("SELECT * FROM transactions WHERE referenceCode = ? AND type = 'Vault Voucher Create'", [code]);
        if (!voucherTx || voucherTx.status !== 'Pending') {
            return res.status(400).json({ success: false, error: 'invalidOrClaimedVoucher' });
        }
        if (voucherTx.userId === userId) {
            return res.status(400).json({ success: false, error: 'cannotRedeemOwnVoucher' });
        }
        
        const amount = Math.abs(voucherTx.amount);
        const creator = await dbGet('SELECT name FROM users WHERE id = ?', [voucherTx.userId]);

        await dbRun('BEGIN TRANSACTION');
        await dbRun("UPDATE transactions SET status = 'Completed' WHERE id = ?", [voucherTx.id]);
        await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId]);
        await addTransactionInternal(userId, {
            description: `Redeemed Voucher from ${creator?.name || '...'}`,
            amount: amount,
            type: 'Vault Voucher Redeem',
            status: 'Completed',
            referenceCode: code
        });
        await dbRun('COMMIT');

        res.json({ success: true });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.cancelVaultVoucher = async (req, res) => {
    const { userId, transactionId } = req.body;
    try {
        const tx = await dbGet("SELECT * FROM transactions WHERE id = ? AND userId = ? AND type = 'Vault Voucher Create'", [transactionId, userId]);
        if (tx && tx.status === 'Pending') {
            await dbRun('BEGIN TRANSACTION');
            await dbRun("UPDATE transactions SET status = 'Failed' WHERE id = ?", [transactionId]); // 'Failed' is used for cancelled
            await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [Math.abs(tx.amount), userId]);
            await dbRun('COMMIT');
        }
        res.status(200).json({ success: true });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ message: err.message });
    }
};
