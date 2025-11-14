const { dbRun, dbGet, initDb } = require('./database');

async function updateVaultChainOfficialProfit() {
    try {
        // Initialize database connection
        await initDb();
        
        // Update monthly profit to 124% (1.24 as decimal)
        await dbRun('UPDATE copy_traders SET monthlyProfit = ? WHERE id = ?', [1.24, 'trader_vc']);
        
        // Verify the update
        const trader = await dbGet('SELECT name, monthlyProfit FROM copy_traders WHERE id = ?', ['trader_vc']);
        
        if (trader) {
            console.log(`✅ Successfully updated ${trader.name} monthly profit to ${(trader.monthlyProfit * 100).toFixed(0)}%`);
        } else {
            console.log('❌ Trader not found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating trader profit:', error);
        process.exit(1);
    }
}

updateVaultChainOfficialProfit();

