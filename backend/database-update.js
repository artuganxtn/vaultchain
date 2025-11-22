/**
 * Database Update Script
 * Applies update-profit-sql.sql changes to the database
 * Run: node backend/database-update.js
 */

const { dbRun, dbGet } = require('./database');

async function applyDatabaseUpdates() {
    try {
        console.log('Starting database updates...');
        
        // Update VaultChain Official monthly profit to 124%
        console.log('Updating copy trader monthly profit...');
        await dbRun(
            "UPDATE copy_traders SET monthlyProfit = ? WHERE id = ?",
            [1.24, 'trader_vc']
        );
        
        // Verify the update
        const trader = await dbGet(
            "SELECT name, monthlyProfit, (monthlyProfit * 100) as monthlyProfitPercent FROM copy_traders WHERE id = ?",
            ['trader_vc']
        );
        
        if (trader) {
            console.log('✅ Update successful!');
            console.log(`Trader: ${trader.name}`);
            console.log(`Monthly Profit: ${trader.monthlyProfit} (${trader.monthlyProfitPercent}%)`);
        } else {
            console.log('⚠️  Trader not found, but update completed');
        }
        
        console.log('Database updates completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error applying database updates:', error);
        process.exit(1);
    }
}

// Initialize database and apply updates
const { initDb } = require('./database');
initDb().then(() => {
    applyDatabaseUpdates();
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

