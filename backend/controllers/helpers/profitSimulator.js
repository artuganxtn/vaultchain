

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

let isRunning = false;
let lastRunTimestamp = 0;
const RUN_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

const safeJsonParse = (jsonString, fallbackValue = []) => {
    if (typeof jsonString !== 'string' || !jsonString) {
        return fallbackValue;
    }
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error(`[ProfitSim] Failed to parse JSON string: "${jsonString}". Error: ${e.message}`);
        return fallbackValue;
    }
};

exports.simulateDailyProfitUpdate = async () => {
    if (isRunning) {
        console.log("[Backend] Profit simulation is already running. Skipping.");
        return;
    }
    const now = Date.now();
    if (now - lastRunTimestamp < RUN_INTERVAL) {
        return;
    }

    isRunning = true;
    console.log("[Backend] Acquiring lock and running daily profit simulation...");

    try {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        if (today.getDay() === 0 || today.getDay() === 6) { // No profits on weekends
            console.log("[Backend] It's the weekend. No profits distributed.");
            lastRunTimestamp = now;
            return;
        }

        // Fetch all users once for efficient team lookups, now with added resilience
        const allUsersRaw = await dbAll('SELECT id, invested, referrals FROM users');
        if (!Array.isArray(allUsersRaw)) {
            throw new Error("Database query for all users did not return an array.");
        }
        
        // Filter out any potentially null or corrupt records before mapping
        const validUsers = allUsersRaw.filter(u => u && u.id);
        const userMap = new Map(validUsers.map(u => [u.id, u]));

        // Fetch only users who need their profit calculated for today
        const usersToProcess = await dbAll('SELECT * FROM users WHERE lastRewardDate IS NULL OR lastRewardDate != ?', [todayStr]);

        for (const user of usersToProcess) {
            try {
                let dailyProfit = 0;
                const investedAmount = Number(user.invested) || 0;

                if (user.isAgent) {
                    if (investedAmount > 0) {
                        const agentLevel = agentProfitConfig.levels.find(l => l.level === user.agentLevel) || agentProfitConfig.levels[0];
                        dailyProfit += investedAmount * agentLevel.profitRate;
                    }
                    const referrals = safeJsonParse(user.referrals, []);
                    if (Array.isArray(referrals)) {
                        for (const referral of referrals) {
                            if (referral && typeof referral === 'object' && referral.userId) {
                                const referredUser = userMap.get(referral.userId);
                                if (referredUser) {
                                    const referredUserInvested = Number(referredUser.invested) || 0;
                                    if (referredUserInvested > 0) {
                                        dailyProfit += referredUserInvested * agentProfitConfig.teamCapitalBonusRate;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (investedAmount > 0) {
                        const plan = mockInvestmentPlans.find(p => p.id === user.activePlanId);
                        if (plan) {
                            dailyProfit = investedAmount * plan.dailyProfitRate;
                        }
                    }
                }
                
                if (dailyProfit > 0) {
                    await dbRun('UPDATE users SET unclaimedProfit = IFNULL(unclaimedProfit, 0) + ?, lastRewardDate = ? WHERE id = ?', [dailyProfit, todayStr, user.id]);
                } else {
                    await dbRun('UPDATE users SET lastRewardDate = ? WHERE id = ?', [todayStr, user.id]);
                }
            } catch (error) {
                console.error(`[CRITICAL] Error processing profit for user ${user.id} (${user.email}). Skipping user.`, error);
            }
        }
        
        lastRunTimestamp = now;
        console.log(`[Backend] Daily profit simulation finished for ${usersToProcess.length} users.`);

    } catch (error) {
        console.error("[CRITICAL] A top-level error occurred during the profit simulation. The process will continue, but profits may not have been calculated for this run.", error);
    } finally {
        isRunning = false;
        console.log("[Backend] Profit simulation lock released.");
    }
};