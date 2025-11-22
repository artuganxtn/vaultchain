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


// Helper to safely parse JSON strings from the database, providing sensible defaults
const parseJsonFields = (items, fields) => {
    if (!Array.isArray(items)) return []; // Guard against non-array input

    return items.map(item => {
        if (typeof item !== 'object' || item === null) return item; // Guard against non-object items in array

        const newItem = { ...item };
        fields.forEach(field => {
            if (!newItem.hasOwnProperty(field)) return; // Skip if field doesn't exist on the object

            const value = newItem[field];
            const isArrayField = ['referrals', 'portfolio', 'performanceHistory', 'tradeHistory', 'reviews', 'priceHistory24h', 'priceHistory1w', 'priceHistory1m', 'priceHistory1y'].includes(field);
            const isSettingsField = field === 'settings';

            // Only attempt to parse if it's a string that looks like JSON
            if (typeof value === 'string' && value.trim().length > 1 && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
                try {
                    newItem[field] = JSON.parse(value);
                } catch (e) {
                    // Malformed JSON string, assign default
                    console.error(`Error parsing field '${field}' for item id ${item.id}:`, e.message);
                    newItem[field] = isArrayField ? [] : (isSettingsField ? {} : null);
                }
            } else if (value === null || value === undefined || value === '') {
                 // Explicitly handle null/empty values by assigning a default
                 newItem[field] = isArrayField ? [] : (isSettingsField ? {} : null);
            }
            // If it's not a string that looks like JSON, or not null/empty (e.g., a number, boolean), leave it as is.
        });
        return newItem;
    });
};

exports.getAllData = async (req, res) => {
    try {
        // In a real app, this would be a separate cron job
        // Run simulation BEFORE fetching data to ensure consistency
        await profitSimulator.simulateDailyProfitUpdate();

        // Disable caching for this endpoint
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        const users = await dbAll('SELECT * FROM users');
        const transactions = await dbAll('SELECT * FROM transactions ORDER BY date DESC');
        const subscriptions = await dbAll('SELECT * FROM subscriptions');
        const copyTraders = await dbAll('SELECT * FROM copy_traders');
        const auditLogs = await dbAll('SELECT * FROM audit_logs ORDER BY timestamp DESC');
        const assets = await dbAll('SELECT * FROM assets');
        const notifications = await dbAll('SELECT * FROM notifications ORDER BY timestamp DESC');

        console.log('[getAllData] Returning data - Transactions:', transactions.length, 'Notifications:', notifications.length);

        res.json({
            users: parseJsonFields(users, ['permissions', 'referrals', 'portfolio', 'kycDocuments', 'notification']),
            transactions: parseJsonFields(transactions, ['dispute', 'withdrawalDetails', 'depositDetails']),
            subscriptions: parseJsonFields(subscriptions, ['settings']),
            copyTraders: parseJsonFields(copyTraders, ['performanceHistory', 'tradeHistory', 'reviews']),
            auditLogs,
            assets: parseJsonFields(assets, ['priceHistory24h', 'priceHistory1w', 'priceHistory1m', 'priceHistory1y']),
            notifications: parseJsonFields(notifications, ['messageParams']),
            investmentPlans: mockInvestmentPlans,
            agentProfitConfig: agentProfitConfig
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};