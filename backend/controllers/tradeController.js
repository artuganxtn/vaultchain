const { dbGet, dbRun } = require('../database');
const { addTransactionInternal } = require('./transactionsController');

exports.executeTrade = async (req, res) => {
    const { userId, assetId, quantity, price, type } = req.body;
    
    try {
        const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
        if (!user) return res.status(404).json({ success: false, error: "User not found" });

        const totalCost = quantity * price;
        let portfolio = JSON.parse(user.portfolio || '[]');

        await dbRun('BEGIN TRANSACTION');

        if (type === 'BUY') {
            if (user.balance < totalCost) {
                await dbRun('ROLLBACK');
                return res.status(400).json({ success: false, error: "insufficientFunds" });
            }
            await dbRun('UPDATE users SET balance = balance - ? WHERE id = ?', [totalCost, userId]);

            let item = portfolio.find(p => p.assetId === assetId);
            if (item) {
                item.averageBuyPrice = ((item.averageBuyPrice * item.quantity) + totalCost) / (item.quantity + quantity);
                item.quantity += quantity;
            } else {
                portfolio.push({ assetId, quantity, averageBuyPrice: price });
            }
        } else { // SELL
            let item = portfolio.find(p => p.assetId === assetId);
            if (!item || item.quantity < quantity) {
                await dbRun('ROLLBACK');
                return res.status(400).json({ success: false, error: "insufficientAssets" });
            }
            item.quantity -= quantity;
            await dbRun('UPDATE users SET balance = balance + ? WHERE id = ?', [totalCost, userId]);

            if (item.quantity === 0) {
                portfolio = portfolio.filter(p => p.assetId !== assetId);
            }
        }
        
        await dbRun('UPDATE users SET portfolio = ? WHERE id = ?', [JSON.stringify(portfolio), userId]);
        
        await addTransactionInternal(userId, {
            description: `${type} ${assetId}`,
            amount: type === 'BUY' ? -totalCost : totalCost,
            type: type,
            status: 'Completed',
            assetId,
            assetQuantity: quantity,
            assetPrice: price
        });

        await dbRun('COMMIT');

        res.json({ success: true });
    } catch (err) {
        await dbRun('ROLLBACK');
        res.status(500).json({ success: false, error: err.message });
    }
};
