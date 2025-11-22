const { dbAll, dbGet } = require('../database');

exports.getAdminKpis = async (req, res) => {
    try {
        // Get total users count (excluding OWNER role)
        const usersCount = await dbGet("SELECT count(*) as count FROM users WHERE role != 'OWNER'");
        
        // Get balance totals
        const balances = await dbGet('SELECT SUM(balance) as totalMain, SUM(invested) as totalInvested, SUM(onHoldBalance) as totalOnHold FROM users');
        
        // Get pending deposits - all deposits awaiting confirmation
        const pendingDeposits = await dbGet("SELECT count(*) as count FROM transactions WHERE type = 'Deposit' AND status = 'Awaiting Confirmation'");
        
        // Get pending withdrawals - includes both Withdrawal and Investment Withdrawal Request
        const pendingWithdrawals = await dbGet(
            "SELECT count(*) as count FROM transactions WHERE (type = 'Withdrawal' OR type = 'Investment Withdrawal Request') AND status = 'Awaiting Confirmation'"
        );
        
        // Get open disputes - check for dispute JSON with status 'Open' or 'Escalated'
        const openDisputesResult = await dbAll("SELECT dispute FROM transactions WHERE dispute IS NOT NULL AND dispute != ''");
        let openDisputes = 0;
        if (openDisputesResult) {
            openDisputes = openDisputesResult.filter(tx => {
                try {
                    const dispute = typeof tx.dispute === 'string' ? JSON.parse(tx.dispute) : tx.dispute;
                    return dispute && (dispute.status === 'Open' || dispute.status === 'Escalated');
                } catch (e) {
                    return false;
                }
            }).length;
        }
        
        // Get KYC pending users
        const kycPending = await dbGet("SELECT count(*) as count FROM users WHERE status = 'Pending'");
        
        // Calculate active sessions - users who were active in the last 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        const activeSessionsResult = await dbGet(
            "SELECT count(*) as count FROM users WHERE lastActive IS NOT NULL AND lastActive > ?",
            [fifteenMinutesAgo]
        );
        const activeSessions = activeSessionsResult || { count: 0 };

        const kpiData = {
            totalUsers: usersCount?.count || 0,
            totalPlatformBalance: (balances?.totalMain || 0) + (balances?.totalInvested || 0) + (balances?.totalOnHold || 0),
            totalMainBalances: balances?.totalMain || 0,
            totalInvestedBalances: balances?.totalInvested || 0,
            totalOnHoldBalances: balances?.totalOnHold || 0,
            sessionsActiveNow: activeSessions?.count || 0,
            pendingDeposits: pendingDeposits?.count || 0,
            pendingWithdrawals: pendingWithdrawals?.count || 0,
            openDisputes: openDisputes,
            kycPending: kycPending?.count || 0,
        };
        
        res.json(kpiData);
    } catch (err) {
        console.error('[KPIs] Error fetching KPIs:', err);
        res.status(500).json({ message: err.message });
    }
};
