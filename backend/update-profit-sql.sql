-- Update VaultChain Official monthly profit to 124%
UPDATE copy_traders SET monthlyProfit = 1.24 WHERE id = 'trader_vc';

-- Verify the update
SELECT name, monthlyProfit, (monthlyProfit * 100) as monthlyProfitPercent FROM copy_traders WHERE id = 'trader_vc';

