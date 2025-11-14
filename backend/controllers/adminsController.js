const { dbRun } = require('../database');
const crypto = require('crypto');

exports.addAdminUser = async (req, res) => {
    const { fullName, email, password, permissions } = req.body;
    try {
        const newAdmin = {
            id: crypto.randomUUID(),
            name: fullName,
            username: email.split('@')[0],
            email: email,
            password: password, // In production, this should be hashed
            role: 'ADMIN',
            status: 'Verified',
            balance: 0,
            invested: 0,
            welcomeBonus: 0,
            onHoldBalance: 0,
            createdAt: new Date().toISOString(),
            walletAddress: '',
            accountNumber: '',
            phone: '',
            referralCode: '',
            referrals: '[]',
            isAgent: false,
            referralBonus: 0,
            totalDeposits: 0,
            depositBonusUsed: false,
            activePlanId: null,
            agentLevel: 0,
            unclaimedProfit: 0,
            portfolio: '[]',
            permissions: JSON.stringify(permissions),
            isFeeExempt: true,
            isFrozen: false,
            isBanned: false,
        };

        const columns = Object.keys(newAdmin).filter(k => newAdmin[k] !== undefined).join(', ');
        const placeholders = Object.keys(newAdmin).filter(k => newAdmin[k] !== undefined).map(() => '?').join(', ');
        const values = Object.values(newAdmin).filter(v => v !== undefined);

        await dbRun(`INSERT INTO users (${columns}) VALUES (${placeholders})`, values);
        
        delete newAdmin.password;
        res.status(201).json(newAdmin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
