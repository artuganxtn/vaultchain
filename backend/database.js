const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.resolve(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to SQLite database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Promisify db.run and db.all for async/await usage
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const dbGet = (sql, params = []) => {
     return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}


const createTables = async () => {
    const createUserTable = `
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY, name TEXT, username TEXT UNIQUE, phone TEXT, email TEXT UNIQUE, password TEXT, role TEXT, status TEXT,
            balance REAL, onHoldBalance REAL, invested REAL, welcomeBonus REAL, createdAt TEXT, walletAddress TEXT, accountNumber TEXT UNIQUE,
            country TEXT, address TEXT, lastActive TEXT, isFrozen BOOLEAN, isBanned BOOLEAN, permissions TEXT, referralCode TEXT UNIQUE,
            referredBy TEXT, referrals TEXT, isAgent BOOLEAN, referralBonus REAL, totalDeposits REAL, depositBonusUsed BOOLEAN,
            activePlanId TEXT, agentLevel INTEGER, lastRewardDate TEXT, unclaimedProfit REAL, kycDocuments TEXT, kycRejectionReason TEXT,
            portfolio TEXT, passwordResetCode TEXT, passwordResetCodeExpires TEXT, investmentStartDate TEXT, isFeeExempt BOOLEAN, notification TEXT
        );`;
    
    const createTransactionTable = `
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY, userId TEXT, recipientId TEXT, date TEXT, description TEXT, amount REAL, originalAmount REAL, originalCurrency TEXT,
            type TEXT, status TEXT, adminId TEXT, referenceCode TEXT, proofImageUrl TEXT, dispute TEXT, withdrawalDetails TEXT,
            vaultVoucherCode TEXT, assetId TEXT, assetQuantity REAL, assetPrice REAL,
            FOREIGN KEY(userId) REFERENCES users(id)
        );`;

    const createSubscriptionTable = `
         CREATE TABLE IF NOT EXISTS subscriptions (
            id TEXT PRIMARY KEY, traderId TEXT, userId TEXT, subscribedAt TEXT, unsubscribedAt TEXT, investedAmount REAL,
            currentValue REAL, pnl REAL, isActive BOOLEAN, settings TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
         );`;
    
    const createCopyTraderTable = `
        CREATE TABLE IF NOT EXISTS copy_traders (
            id TEXT PRIMARY KEY, name TEXT, avatar TEXT, riskLevel TEXT, dailyProfit REAL, weeklyProfit REAL, monthlyProfit REAL,
            followers INTEGER, strategyDescription TEXT, winRate REAL, openTrades INTEGER, performanceHistory TEXT, profitShare REAL,
            aum REAL, rating REAL, avgHoldingTime TEXT, avgDailyTrades REAL, tradeHistory TEXT, reviews TEXT
        );`;

    const createAuditLogTable = `
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY, timestamp TEXT, adminId TEXT, action TEXT, targetUserId TEXT, details TEXT
        );`;
        
    const createAssetsTable = `
        CREATE TABLE IF NOT EXISTS assets (
            id TEXT PRIMARY KEY, name TEXT, symbol TEXT, price REAL, bid REAL, ask REAL, change24h REAL, icon TEXT,
            tradingViewSymbol TEXT, category TEXT, priceHistory24h TEXT, priceHistory1w TEXT, priceHistory1m TEXT, priceHistory1y TEXT
        );`;

    const createNotificationTable = `
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            userId TEXT,
            timestamp TEXT,
            messageKey TEXT,
            messageParams TEXT,
            type TEXT,
            isRead BOOLEAN,
            link TEXT,
            FOREIGN KEY(userId) REFERENCES users(id)
        );`;

    await dbRun(createUserTable);
    await dbRun(createTransactionTable);
    await dbRun(createSubscriptionTable);
    await dbRun(createCopyTraderTable);
    await dbRun(createAuditLogTable);
    await dbRun(createAssetsTable);
    await dbRun(createNotificationTable);
    console.log("Tables created or already exist.");
};

const seedDatabase = async () => {
    // Check if seeding is necessary
    const res = await dbGet(`SELECT count(*) as count FROM users`);
    if (res.count > 0) {
        console.log('Database already seeded.');
        return;
    }
    console.log('Seeding database with initial data...');

    const initialAssets = [
        // Cryptocurrencies
        { id: 'btc', name: 'Bitcoin', symbol: 'BTC/USD', price: 68100.50, bid: 68098.20, ask: 68102.80, change24h: 2.5, icon: 'BitcoinIcon', tradingViewSymbol: 'BINANCE:BTCUSDT', category: 'Crypto' },
        { id: 'eth', name: 'Ethereum', symbol: 'ETH/USD', price: 3550.75, bid: 3550.15, ask: 3551.35, change24h: -1.2, icon: 'EthereumIcon', tradingViewSymbol: 'BINANCE:ETHUSDT', category: 'Crypto' },
        { id: 'usdt', name: 'Tether', symbol: 'USDT/USD', price: 1.00, bid: 0.9998, ask: 1.0002, change24h: 0.01, icon: 'TetherIcon', tradingViewSymbol: 'COINBASE:USDTUSD', category: 'Crypto' },
        { id: 'sol', name: 'Solana', symbol: 'SOL/USD', price: 150.25, bid: 150.20, ask: 150.30, change24h: 5.8, icon: 'SolanaIcon', tradingViewSymbol: 'BINANCE:SOLUSDT', category: 'Crypto' },
        { id: 'xrp', name: 'XRP', symbol: 'XRP/USD', price: 0.52, bid: 0.519, ask: 0.521, change24h: -0.5, icon: 'XrpIcon', tradingViewSymbol: 'BINANCE:XRPUSDT', category: 'Crypto' },
        { id: 'doge', name: 'Dogecoin', symbol: 'DOGE/USD', price: 0.15, bid: 0.149, ask: 0.151, change24h: 10.2, icon: 'DogeIcon', tradingViewSymbol: 'BINANCE:DOGEUSDT', category: 'Crypto' },
        { id: 'ada', name: 'Cardano', symbol: 'ADA/USD', price: 0.45, bid: 0.449, ask: 0.451, change24h: 1.1, icon: 'AdaIcon', tradingViewSymbol: 'BINANCE:ADAUSDT', category: 'Crypto' },
        // Forex
        { id: 'eurusd', name: 'EUR/USD', symbol: 'EUR/USD', price: 1.0850, bid: 1.0849, ask: 1.0851, change24h: 0.2, icon: 'EurUsdIcon', tradingViewSymbol: 'OANDA:EURUSD', category: 'Forex' },
        { id: 'gbpusd', name: 'GBP/USD', symbol: 'GBP/USD', price: 1.2750, bid: 1.2748, ask: 1.2752, change24h: -0.1, icon: 'GbpUsdIcon', tradingViewSymbol: 'OANDA:GBPUSD', category: 'Forex' },
        { id: 'usdtry', name: 'USD/TRY', symbol: 'USD/TRY', price: 32.50, bid: 32.49, ask: 32.51, change24h: 0.5, icon: 'UsdTryIcon', tradingViewSymbol: 'FX_IDC:USDTRY', category: 'Forex' },
        // Commodities
        { id: 'xauusd', name: 'Gold', symbol: 'XAU/USD', price: 2350.00, bid: 2349.80, ask: 2350.20, change24h: 0.8, icon: 'GoldIcon', tradingViewSymbol: 'OANDA:XAUUSD', category: 'Commodities' },
        { id: 'xagusd', name: 'Silver', symbol: 'XAG/USD', price: 28.50, bid: 28.48, ask: 28.52, change24h: 1.5, icon: 'SilverIcon', tradingViewSymbol: 'OANDA:XAGUSD', category: 'Commodities' },
        { id: 'wtico', name: 'Crude Oil', symbol: 'WTI/USD', price: 78.50, bid: 78.48, ask: 78.52, change24h: -1.0, icon: 'OilIcon', tradingViewSymbol: 'OANDA:WTICOUSD', category: 'Commodities' },
        // Stocks
        { id: 'aapl', name: 'Apple Inc.', symbol: 'AAPL', price: 195.00, bid: 194.95, ask: 195.05, change24h: 1.2, icon: 'AaplIcon', tradingViewSymbol: 'NASDAQ:AAPL', category: 'Stocks' },
        { id: 'googl', name: 'Alphabet Inc.', symbol: 'GOOGL', price: 175.00, bid: 174.90, ask: 175.10, change24h: -0.5, icon: 'GooglIcon', tradingViewSymbol: 'NASDAQ:GOOGL', category: 'Stocks' },
    ];

    const initialCopyTraders = [
        { id: 'trader_vc', name: 'VaultChain Official', avatar: 'VaultIcon', riskLevel: 'Low', dailyProfit: 0.005, weeklyProfit: 0.035, monthlyProfit: 1.24, followers: 1250, strategyDescription: 'Conservative, long-term growth strategy focusing on major crypto and stock assets with low leverage. Ideal for stable returns.', winRate: 92, openTrades: 3, performanceHistory: JSON.stringify([{ month: 'Jan', profit: 110 }, { month: 'Feb', profit: 118 }, { month: 'Mar', profit: 122 }, { month: 'Apr', profit: 124 }]), profitShare: 10, aum: 2500000, rating: 4.9, avgHoldingTime: '5 days', avgDailyTrades: 2, tradeHistory: JSON.stringify([{ assetSymbol: 'BTC', pnl: 2.5, closeDate: '2023-04-20', type: 'BUY' }]), reviews: JSON.stringify([{ id: 'rev1', reviewerName: 'Khtab Majed', rating: 5, comment: 'Very stable and reliable.', date: '2023-04-15' }]) },
        { id: 'trader_2', name: 'Crypto Scalper', avatar: 'SparklesIcon', riskLevel: 'High', dailyProfit: 0.02, weeklyProfit: 0.14, monthlyProfit: 0.60, followers: 350, strategyDescription: 'High-frequency scalping on volatile crypto pairs. Aims for small, quick profits. High risk, high reward.', winRate: 75, openTrades: 12, performanceHistory: JSON.stringify([{ month: 'Jan', profit: 40 }, { month: 'Feb', profit: -10 }, { month: 'Mar', profit: 65 }, { month: 'Apr', profit: 55 }]), profitShare: 25, aum: 750000, rating: 4.2, avgHoldingTime: '15 minutes', avgDailyTrades: 25, tradeHistory: JSON.stringify([{ assetSymbol: 'SOL', pnl: 0.8, closeDate: '2023-04-22', type: 'SELL' }]), reviews: JSON.stringify([]) },
        { id: 'trader_3', name: 'Forex Swing', avatar: 'GlobeAltIcon', riskLevel: 'Medium', dailyProfit: 0.008, weeklyProfit: 0.05, monthlyProfit: 0.22, followers: 890, strategyDescription: 'Swing trading major Forex pairs based on technical and fundamental analysis. Positions held for several days to weeks.', winRate: 85, openTrades: 5, performanceHistory: JSON.stringify([{ month: 'Jan', profit: 20 }, { month: 'Feb', profit: 25 }, { month: 'Mar', profit: 18 }, { month: 'Apr', profit: 23 }]), profitShare: 15, aum: 1200000, rating: 4.7, avgHoldingTime: '1 week', avgDailyTrades: 1, tradeHistory: JSON.stringify([{ assetSymbol: 'EUR/USD', pnl: 1.5, closeDate: '2023-04-18', type: 'BUY' }]), reviews: JSON.stringify([]) }
    ];

    const initialUsers = [
        { id: '2', name: 'Majed Jumaa Al-Malkad', username: 'macitcomah', phone: '+90-555-123-4567', email: 'macitcomah@gmail.com', password: '2Macit.salma', role: 'OWNER', status: 'Verified', balance: 0, onHoldBalance: 0, invested: 0, welcomeBonus: 0, createdAt: '2023-01-01T12:00:00Z', walletAddress: '0x0a9b8c7d6e5f4g3h2i1j', accountNumber: '87654321', country: 'Turkey', lastActive: new Date().toISOString(), referralCode: 'MACIT1', referrals: '[]', isAgent: false, referralBonus: 0, totalDeposits: 0, depositBonusUsed: false, activePlanId: null, unclaimedProfit: 0, agentLevel: 0, portfolio: '[]', isFeeExempt: true, isFrozen: false, isBanned: false, permissions: JSON.stringify({ canManageUsers: true, canAdjustBalance: true, canApproveKyc: true }) },
        { id: 'fee_collector', name: 'Fee Collector', username: 'fees', phone: '', email: 'khtab7342@gmail.com', password: crypto.randomUUID(), role: 'USER', status: 'Verified', balance: 0, onHoldBalance: 0, invested: 0, welcomeBonus: 0, createdAt: '2023-01-01T12:00:00Z', walletAddress: crypto.randomUUID(), accountNumber: '00000000', country: 'System', lastActive: new Date().toISOString(), referralCode: 'FEES', referrals: '[]', isAgent: false, referralBonus: 0, totalDeposits: 0, depositBonusUsed: false, activePlanId: null, unclaimedProfit: 0, agentLevel: 0, portfolio: '[]', isFeeExempt: true, isFrozen: false, isBanned: false, permissions: '{}' },
        { id: '3', name: 'Khtab Majed Al-Malkad', username: 'khtab7341', phone: '+966555123456', email: 'khtab7341@gmail.com', password: '2Macit.salma', role: 'USER', status: 'Verified', balance: 10, onHoldBalance: 0, invested: 0, welcomeBonus: 10, createdAt: '2023-10-26T10:00:00Z', walletAddress: '0x1b2c3d4e5f6g7h8i9j0k', accountNumber: '10001234', country: 'SA', lastActive: new Date().toISOString(), referralCode: 'KHTAB7341', referredBy: null, referrals: '[]', isAgent: true, referralBonus: 0, totalDeposits: 0, depositBonusUsed: false, activePlanId: null, unclaimedProfit: 0, agentLevel: 1, portfolio: '[]', isFeeExempt: false, isFrozen: false, isBanned: false, permissions: '{}' },
        { id: 'user_jane', name: 'Jane Doe', username: 'janedoe', phone: '+1-555-555-5555', email: 'jane.doe@example.com', password: 'password123', role: 'USER', status: 'Verified', balance: 2500, onHoldBalance: 0, invested: 5000, welcomeBonus: 10, createdAt: '2024-03-15T10:00:00Z', walletAddress: crypto.randomUUID(), accountNumber: '12345678', country: 'US', lastActive: new Date().toISOString(), referralCode: 'JANE123', referrals: '[]', isAgent: false, referralBonus: 0, totalDeposits: 5000, depositBonusUsed: true, activePlanId: 'plan_2', unclaimedProfit: 125.50, agentLevel: 0, portfolio: JSON.stringify([{assetId: 'btc', quantity: 0.05, averageBuyPrice: 65000}]), isFeeExempt: false, investmentStartDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), isFrozen: false, isBanned: false, permissions: '{}' },
        { id: 'user_john', name: 'John Smith', username: 'johnsmith', phone: '+44-20-7946-0958', email: 'john.smith@example.com', password: 'password123', role: 'USER', status: 'Pending', balance: 50, onHoldBalance: 0, invested: 0, welcomeBonus: 0, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), walletAddress: crypto.randomUUID(), accountNumber: '87654322', country: 'GB', lastActive: new Date().toISOString(), referralCode: 'JOHN456', referrals: '[]', isAgent: false, referralBonus: 0, totalDeposits: 100, depositBonusUsed: false, activePlanId: null, unclaimedProfit: 0, agentLevel: 0, portfolio: '[]', isFeeExempt: false, isFrozen: true, isBanned: false, notification: JSON.stringify({type: 'freeze', reason: 'Account under review due to suspicious activity.', timestamp: Date.now()}), permissions: '{}' },
        { id: 'user_bnbn', name: 'Test User', username: 'bnbn1', phone: '+33-123-456-789', email: 'bnbn1@gmx.fr', password: 'password123', role: 'USER', status: 'Verified', balance: 100, onHoldBalance: 0, invested: 0, welcomeBonus: 10, createdAt: new Date().toISOString(), walletAddress: crypto.randomUUID(), accountNumber: '99999999', country: 'FR', lastActive: new Date().toISOString(), referralCode: 'BNBN1', referrals: '[]', isAgent: false, referralBonus: 0, totalDeposits: 0, depositBonusUsed: false, activePlanId: null, unclaimedProfit: 0, agentLevel: 0, portfolio: '[]', isFeeExempt: false, isFrozen: false, isBanned: false, permissions: '{}' }
    ];

    const initialTransactions = [
        { id: 'tx_bonus_khtab', userId: '3', date: '2023-10-26T10:00:01Z', description: 'Welcome Bonus', amount: 10, type: 'Bonus', status: 'Completed' },
        { id: crypto.randomUUID(), userId: 'user_jane', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), description: 'Invested in plan plan_2', amount: -5000, type: 'Investment', status: 'Completed' },
        { id: crypto.randomUUID(), userId: 'user_john', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), description: 'Deposit Request', amount: 100, type: 'Deposit', status: 'Awaiting Confirmation', referenceCode: 'VC-123456' },
        { id: crypto.randomUUID(), userId: 'user_jane', recipientId: '3', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: 'Transfer to Khtab Majed Al-Malkad', amount: -200, type: 'Internal Transfer', status: 'Completed' },
        { id: crypto.randomUUID(), userId: '3', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), description: 'Received from Jane Doe', amount: 200, type: 'Internal Transfer', status: 'Completed', recipientId: '3' }
    ];
    
    const initialSubscriptions = [
        { id: crypto.randomUUID(), traderId: 'trader_vc', userId: 'user_jane', subscribedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), investedAmount: 1000, currentValue: 1150, pnl: 150, isActive: true, settings: JSON.stringify({ copyRatio: 100, maxLot: 1, maxDailyTrades: 5, globalStopLoss: 15, dailyTarget: 4, autoCopy: true })},
        { id: crypto.randomUUID(), traderId: 'trader_2', userId: 'user_jane', subscribedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), unsubscribedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), investedAmount: 500, currentValue: 750, pnl: 250, isActive: false, settings: JSON.stringify({ copyRatio: 100, maxLot: 1, maxDailyTrades: 5, globalStopLoss: 15, dailyTarget: 4, autoCopy: true })}
    ];
    
    const initialAuditLogs = [
        {id: crypto.randomUUID(), timestamp: new Date().toISOString(), adminId: '2', action: 'LOGIN', details: 'Admin Macit Comah logged in.'},
        {id: crypto.randomUUID(), timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), adminId: '2', action: 'FREEZE_ACCOUNT', targetUserId: 'user_john', details: 'Froze account for John Smith due to suspicious activity.'}
    ];

    const initialNotifications = [
        { id: crypto.randomUUID(), userId: '3', timestamp: new Date().toISOString(), messageKey: 'notif_welcome', messageParams: '{}', type: 'success', isRead: false },
        { id: crypto.randomUUID(), userId: 'user_jane', timestamp: new Date().toISOString(), messageKey: 'notif_welcome', messageParams: '{}', type: 'success', isRead: true },
    ];

    db.serialize(async () => {
        try {
            // Assets
            const assetStmt = db.prepare(`INSERT INTO assets (id, name, symbol, price, bid, ask, change24h, icon, tradingViewSymbol, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            initialAssets.forEach(a => assetStmt.run(a.id, a.name, a.symbol, a.price, a.bid, a.ask, a.change24h, a.icon, a.tradingViewSymbol, a.category));
            assetStmt.finalize();

            // Copy Traders
            const traderStmt = db.prepare(`INSERT INTO copy_traders (id, name, avatar, riskLevel, dailyProfit, weeklyProfit, monthlyProfit, followers, strategyDescription, winRate, openTrades, performanceHistory, profitShare, aum, rating, avgHoldingTime, avgDailyTrades, tradeHistory, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            initialCopyTraders.forEach(t => traderStmt.run(t.id, t.name, t.avatar, t.riskLevel, t.dailyProfit, t.weeklyProfit, t.monthlyProfit, t.followers, t.strategyDescription, t.winRate, t.openTrades, t.performanceHistory, t.profitShare, t.aum, t.rating, t.avgHoldingTime, t.avgDailyTrades, t.tradeHistory, t.reviews));
            traderStmt.finalize();

            // Users
            const userStmt = db.prepare(`INSERT INTO users (id, name, username, phone, email, password, role, status, balance, onHoldBalance, invested, welcomeBonus, createdAt, walletAddress, accountNumber, country, lastActive, referralCode, referrals, isAgent, referralBonus, totalDeposits, depositBonusUsed, activePlanId, unclaimedProfit, agentLevel, portfolio, isFeeExempt, isFrozen, isBanned, notification, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            initialUsers.forEach(u => userStmt.run(u.id, u.name, u.username, u.phone, u.email, u.password, u.role, u.status, u.balance, u.onHoldBalance, u.invested, u.welcomeBonus, u.createdAt, u.walletAddress, u.accountNumber, u.country, u.lastActive, u.referralCode, u.referrals, u.isAgent, u.referralBonus, u.totalDeposits, u.depositBonusUsed, u.activePlanId, u.unclaimedProfit, u.agentLevel, u.portfolio, u.isFeeExempt, u.isFrozen, u.isBanned, u.notification, u.permissions));
            userStmt.finalize();
            
            // Transactions
            const txStmt = db.prepare(`INSERT INTO transactions (id, userId, date, description, amount, type, status, recipientId, referenceCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            initialTransactions.forEach(tx => txStmt.run(tx.id, tx.userId, tx.date, tx.description, tx.amount, tx.type, tx.status, tx.recipientId, tx.referenceCode));
            txStmt.finalize();
            
            // Subscriptions
            const subStmt = db.prepare(`INSERT INTO subscriptions (id, traderId, userId, subscribedAt, unsubscribedAt, investedAmount, currentValue, pnl, isActive, settings) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            initialSubscriptions.forEach(s => subStmt.run(s.id, s.traderId, s.userId, s.subscribedAt, s.unsubscribedAt, s.investedAmount, s.currentValue, s.pnl, s.isActive, s.settings));
            subStmt.finalize();

            // Audit Logs
            const logStmt = db.prepare(`INSERT INTO audit_logs (id, timestamp, adminId, action, targetUserId, details) VALUES (?, ?, ?, ?, ?, ?)`);
            initialAuditLogs.forEach(log => logStmt.run(log.id, log.timestamp, log.adminId, log.action, log.targetUserId, log.details));
            logStmt.finalize();
            
            // Notifications
            const notifStmt = db.prepare(`INSERT INTO notifications (id, userId, timestamp, messageKey, messageParams, type, isRead) VALUES (?, ?, ?, ?, ?, ?, ?)`);
            initialNotifications.forEach(n => notifStmt.run(n.id, n.userId, n.timestamp, n.messageKey, n.messageParams, n.type, n.isRead));
            notifStmt.finalize();

            console.log('Database seeded successfully.');
        } catch (err) {
            console.error('Error seeding database:', err);
        }
    });
};

const initDb = async () => {
    return new Promise(async (resolve, reject) => {
        db.serialize(async () => {
            try {
                await createTables();
                await seedDatabase();
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
};

module.exports = { db, initDb, dbRun, dbAll, dbGet };