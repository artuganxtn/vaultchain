const { dbAll } = require('../database');
const profitSimulator = require('./helpers/profitSimulator');

// These are now served from the backend
const mockInvestmentPlans = [
  { id: 'plan_1', nameKey: 'starterPlan', minInvestment: 250, dailyProfitRate: 0.0350 },
  { id: 'plan_2', nameKey: 'advancedPlan', minInvestment: 1000, dailyProfitRate: 0.0575 },
  { id: 'plan_3', nameKey: 'professionalPlan', minInvestment: 2000, dailyProfitRate: 0.0950 },
];

const agentProfitConfig = {
    teamCapitalBonusRate: 0.015,
    levels: [
        { level: 0, referralsNeeded: 0, profitRate: 0, label: ''},
        { level: 1, referralsNeeded: 5, profitRate: 0.055, label: 'V1' },
        { level: 2, referralsNeeded: 50, profitRate: 0.088, label: 'V2' },
        { level: 3, referralsNeeded: 100, profitRate: 0.159, label: 'V3' } 
    ]
};


// Helper to parse JSON fields from DB results
const parseJsonFields = (items, fields) => {
    return items.map(item => {
        const newItem = { ...item };
        fields.forEach(field => {
            if (newItem[field]) {
                try {
                    newItem[field] = JSON.parse(newItem[field]);
                } catch(e) {
                    console.error(`Failed to parse JSON for field ${field} in item ${item.id}`);
                    newItem[field] = null;
                }
            }
        });
        return newItem;
    });
}

exports.getAllData = async (req, res) => {
    try {
        // In a real app, this would be a separate cron job
        // Run simulation BEFORE fetching data to ensure consistency
        await profitSimulator.simulateDailyProfitUpdate();

        const users = await dbAll('SELECT * FROM users');
        const transactions = await dbAll('SELECT * FROM transactions ORDER BY date DESC');
        const subscriptions = await dbAll('SELECT * FROM subscriptions');
        const copyTraders = await dbAll('SELECT * FROM copy_traders'); // Assuming you add seeding for these
        const auditLogs = await dbAll('SELECT * FROM audit_logs ORDER BY timestamp DESC');
        const assets = await dbAll('SELECT * FROM assets'); // Assuming you add seeding for these

        res.json({
            users: parseJsonFields(users, ['permissions', 'referrals', 'portfolio', 'kycDocuments', 'notification']),
            transactions: parseJsonFields(transactions, ['dispute', 'withdrawalDetails']),
            subscriptions: parseJsonFields(subscriptions, ['settings']),
            copyTraders: parseJsonFields(copyTraders, ['performanceHistory', 'tradeHistory', 'reviews']),
            auditLogs,
            assets: parseJsonFields(assets, ['priceHistory24h', 'priceHistory1w', 'priceHistory1m', 'priceHistory1y']),
            // Now serving this config from backend
            investmentPlans: mockInvestmentPlans,
            agentProfitConfig: agentProfitConfig
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};