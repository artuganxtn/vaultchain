const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun } = require('../database');

// Utility endpoint to recalculate user balances (for fixing existing data)
router.post('/recalculate-balances', async (req, res) => {
    try {
        const users = await dbAll('SELECT id FROM users');
        let fixed = 0;
        
        for (const user of users) {
            const userId = user.id;
            
            // Calculate balance from all completed transactions
            const [deposits, bonuses, deductions, additions] = await Promise.all([
                dbAll(`SELECT SUM(amount) as total FROM transactions WHERE userId = ? AND type = 'Deposit' AND status = 'Completed'`, [userId]),
                dbAll(`SELECT SUM(amount) as total FROM transactions WHERE userId = ? AND type = 'Bonus' AND status = 'Completed'`, [userId]),
                dbAll(`SELECT SUM(ABS(amount)) as total FROM transactions WHERE userId = ? AND amount < 0 AND status = 'Completed' AND type IN ('Withdrawal', 'Investment', 'Penalty Fee', 'Internal Transfer')`, [userId]),
                dbAll(`SELECT SUM(amount) as total FROM transactions WHERE userId = ? AND amount > 0 AND status = 'Completed' AND type IN ('Profit', 'Copy Trading Profit', 'Internal Transfer', 'Vault Voucher Redeem', 'Admin Adjustment')`, [userId])
            ]);
            
            const totalDeposits = deposits[0]?.total || 0;
            const totalBonuses = bonuses[0]?.total || 0;
            const totalDeductions = deductions[0]?.total || 0;
            const totalAdditions = additions[0]?.total || 0;
            const expectedBalance = totalDeposits + totalBonuses + totalAdditions - totalDeductions;
            
            const currentUser = await dbGet('SELECT balance FROM users WHERE id = ?', [userId]);
            if (currentUser && Math.abs(currentUser.balance - expectedBalance) > 0.01) {
                await dbRun('UPDATE users SET balance = ?, totalDeposits = ? WHERE id = ?', [expectedBalance, totalDeposits, userId]);
                fixed++;
                console.log(`Fixed balance for user ${userId}: ${currentUser.balance} -> ${expectedBalance}`);
            }
        }
        
        return res.json({ message: `Recalculated balances for ${fixed} users` });
    } catch (err) {
        console.error('Recalculate balances error:', err);
        return res.status(500).json({ message: 'Failed to recalculate balances', error: err.message });
    }
});

// KPIs computed from DB
router.get('/kpis', async (req, res) => {
  try {
    const [users, transactions] = await Promise.all([
      dbAll('SELECT id, balance, onHoldBalance, invested, status, lastActive, kycDocuments FROM users'),
      dbAll('SELECT type, status, dispute FROM transactions')
    ]);

    // Ensure we have arrays even if database returns null/undefined
    const usersList = Array.isArray(users) ? users : [];
    const transactionsList = Array.isArray(transactions) ? transactions : [];

    const now = Date.now();
    const FIFTEEN_MIN = 15 * 60 * 1000;

    const totalUsers = usersList.length;
    const totals = usersList.reduce((acc, u) => {
      acc.main += Number(u.balance || 0);
      acc.invested += Number(u.invested || 0);
      acc.onhold += Number(u.onHoldBalance || 0);
      return acc;
    }, { main: 0, invested: 0, onhold: 0 });

    const totalPlatformBalance = totals.main + totals.invested + totals.onhold;
    const totalMainBalances = totals.main;
    const totalInvestedBalances = totals.invested;
    const totalOnHoldBalances = totals.onhold;

    const sessionsActiveNow = usersList.filter(u => {
      if (!u.lastActive) return false;
      const ts = Date.parse(u.lastActive);
      if (isNaN(ts)) return false;
      return (now - ts) <= FIFTEEN_MIN;
    }).length;

    const pendingDeposits = transactionsList.filter(t => 
      t.type === 'Deposit' && (t.status === 'Pending' || t.status === 'Awaiting Confirmation')
    ).length;
    
    const pendingWithdrawals = transactionsList.filter(t => 
      t.type === 'Withdrawal' && (t.status === 'Pending' || t.status === 'Awaiting Confirmation')
    ).length;
    
    const openDisputes = transactionsList.filter(t => {
      if (!t.dispute) return false;
      try { 
        const d = JSON.parse(t.dispute); 
        return d && d.status === 'Open'; 
      } catch (e) { 
        return false; 
      }
    }).length;

    const kycPending = usersList.filter(u => 
      u.status === 'Pending' || u.status === 'Unverified'
    ).length;

    const kpiData = {
      totalUsers,
      totalPlatformBalance,
      totalMainBalances,
      totalInvestedBalances,
      totalOnHoldBalances,
      sessionsActiveNow,
      pendingDeposits,
      pendingWithdrawals,
      openDisputes,
      kycPending
    };

    console.log('KPIs computed:', kpiData);
    return res.json(kpiData);
  } catch (err) {
    console.error('KPIs error:', err);
    console.error('Error stack:', err.stack);
    return res.status(500).json({ 
      message: 'Failed to compute KPIs',
      error: err.message 
    });
  }
});

module.exports = router;


