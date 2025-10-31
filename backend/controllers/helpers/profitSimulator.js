const { dbAll, dbRun } = require('../../database');

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

let lastRunTimestamp = 0;
const RUN_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

exports.simulateDailyProfitUpdate = async () => {
    const now = Date.now();
    if (now - lastRunTimestamp < RUN_INTERVAL) {
        // console.log("[Backend] Profit simulation skipped, ran too recently.");
        return;
    }
    
    console.log("[Backend] Running daily profit simulation...");
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Do not run on weekends (Saturday=6, Sunday=0)
    if (today.getDay() === 0 || today.getDay() === 6) {
        console.log("[Backend] It's the weekend. No profits distributed.");
        lastRunTimestamp = now; // Update timestamp to prevent re-running for the interval
        return;
    }

    const users = await dbAll('SELECT * FROM users WHERE lastRewardDate IS NULL OR lastRewardDate != ?', [todayStr]);

    for (const user of users) {
        let dailyProfit = 0;
        if (user.invested > 0) {
             if (user.isAgent) {
                const agentLevel = agentProfitConfig.levels.find(l => l.level === user.agentLevel) || agentProfitConfig.levels[0];
                dailyProfit = user.invested * agentLevel.profitRate;
            } else {
                const plan = mockInvestmentPlans.find(p => p.id === user.activePlanId);
                if (plan) {
                    dailyProfit = user.invested * plan.dailyProfitRate;
                }
            }
        }
        
        if (dailyProfit > 0) {
            // FIX: Use IFNULL to prevent errors if unclaimedProfit is NULL in the DB.
            await dbRun('UPDATE users SET unclaimedProfit = IFNULL(unclaimedProfit, 0) + ?, lastRewardDate = ? WHERE id = ?', [dailyProfit, todayStr, user.id]);
        } else {
            // Fix: Update lastRewardDate even if profit is zero to avoid reprocessing
            await dbRun('UPDATE users SET lastRewardDate = ? WHERE id = ?', [todayStr, user.id]);
        }
    }
    
    lastRunTimestamp = now;
    console.log(`[Backend] Daily profit simulation finished for ${users.length} users.`);
};