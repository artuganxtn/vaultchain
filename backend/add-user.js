<<<<<<< HEAD
const { initDb, dbRun, dbGet } = require('./database');
const crypto = require('crypto');

async function addUser() {
    try {
        await initDb();
        
        // Check if user already exists
        const existingUser = await dbGet(`SELECT id FROM users WHERE email = ?`, ['bnbn1@gmx.fr']);
        
        if (existingUser) {
            console.log('✅ User with email bnbn1@gmx.fr already exists!');
            process.exit(0);
        }
        
        // Add the user
        const userId = 'user_bnbn';
        const userData = {
            id: userId,
            name: 'Test User',
            username: 'bnbn1',
            phone: '+33-123-456-789',
            email: 'bnbn1@gmx.fr',
            password: 'password123',
            role: 'USER',
            status: 'Verified',
            balance: 100,
            onHoldBalance: 0,
            invested: 0,
            welcomeBonus: 10,
            createdAt: new Date().toISOString(),
            walletAddress: crypto.randomUUID(),
            accountNumber: '99999999',
            country: 'FR',
            lastActive: new Date().toISOString(),
            referralCode: 'BNBN1',
            referrals: '[]',
            isAgent: false,
            referralBonus: 0,
            totalDeposits: 0,
            depositBonusUsed: false,
            activePlanId: null,
            unclaimedProfit: 0,
            agentLevel: 0,
            portfolio: '[]',
            isFeeExempt: false,
            isFrozen: false,
            isBanned: false,
            permissions: '{}'
        };
        
        const sql = `INSERT INTO users (
            id, name, username, phone, email, password, role, status, balance, onHoldBalance, 
            invested, welcomeBonus, createdAt, walletAddress, accountNumber, country, 
            lastActive, referralCode, referrals, isAgent, referralBonus, totalDeposits, 
            depositBonusUsed, activePlanId, unclaimedProfit, agentLevel, portfolio, 
            isFeeExempt, isFrozen, isBanned, permissions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await dbRun(sql, [
            userData.id, userData.name, userData.username, userData.phone, userData.email,
            userData.password, userData.role, userData.status, userData.balance, userData.onHoldBalance,
            userData.invested, userData.welcomeBonus, userData.createdAt, userData.walletAddress,
            userData.accountNumber, userData.country, userData.lastActive, userData.referralCode,
            userData.referrals, userData.isAgent, userData.referralBonus, userData.totalDeposits,
            userData.depositBonusUsed, userData.activePlanId, userData.unclaimedProfit,
            userData.agentLevel, userData.portfolio, userData.isFeeExempt, userData.isFrozen,
            userData.isBanned, userData.permissions
        ]);
        
        console.log('✅ User bnbn1@gmx.fr added successfully!');
        console.log('   Username: bnbn1');
        console.log('   Password: password123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding user:', error);
        process.exit(1);
    }
}

addUser();

=======
const { initDb, dbRun, dbGet } = require('./database');
const crypto = require('crypto');

async function addUser() {
    try {
        await initDb();
        
        // Check if user already exists
        const existingUser = await dbGet(`SELECT id FROM users WHERE email = ?`, ['bnbn1@gmx.fr']);
        
        if (existingUser) {
            console.log('✅ User with email bnbn1@gmx.fr already exists!');
            process.exit(0);
        }
        
        // Add the user
        const userId = 'user_bnbn';
        const userData = {
            id: userId,
            name: 'Test User',
            username: 'bnbn1',
            phone: '+33-123-456-789',
            email: 'bnbn1@gmx.fr',
            password: 'password123',
            role: 'USER',
            status: 'Verified',
            balance: 100,
            onHoldBalance: 0,
            invested: 0,
            welcomeBonus: 10,
            createdAt: new Date().toISOString(),
            walletAddress: crypto.randomUUID(),
            accountNumber: '99999999',
            country: 'FR',
            lastActive: new Date().toISOString(),
            referralCode: 'BNBN1',
            referrals: '[]',
            isAgent: false,
            referralBonus: 0,
            totalDeposits: 0,
            depositBonusUsed: false,
            activePlanId: null,
            unclaimedProfit: 0,
            agentLevel: 0,
            portfolio: '[]',
            isFeeExempt: false,
            isFrozen: false,
            isBanned: false,
            permissions: '{}'
        };
        
        const sql = `INSERT INTO users (
            id, name, username, phone, email, password, role, status, balance, onHoldBalance, 
            invested, welcomeBonus, createdAt, walletAddress, accountNumber, country, 
            lastActive, referralCode, referrals, isAgent, referralBonus, totalDeposits, 
            depositBonusUsed, activePlanId, unclaimedProfit, agentLevel, portfolio, 
            isFeeExempt, isFrozen, isBanned, permissions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await dbRun(sql, [
            userData.id, userData.name, userData.username, userData.phone, userData.email,
            userData.password, userData.role, userData.status, userData.balance, userData.onHoldBalance,
            userData.invested, userData.welcomeBonus, userData.createdAt, userData.walletAddress,
            userData.accountNumber, userData.country, userData.lastActive, userData.referralCode,
            userData.referrals, userData.isAgent, userData.referralBonus, userData.totalDeposits,
            userData.depositBonusUsed, userData.activePlanId, userData.unclaimedProfit,
            userData.agentLevel, userData.portfolio, userData.isFeeExempt, userData.isFrozen,
            userData.isBanned, userData.permissions
        ]);
        
        console.log('✅ User bnbn1@gmx.fr added successfully!');
        console.log('   Username: bnbn1');
        console.log('   Password: password123');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding user:', error);
        process.exit(1);
    }
}

addUser();

>>>>>>> 8cf7b9904c0e59190db7233e79357b9d9ab0b44b
