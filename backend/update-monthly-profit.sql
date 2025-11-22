-- Update VaultChain Official monthly profit to 124%
UPDATE copy_traders SET monthlyProfit = 1.24 WHERE id = 'trader_vc';

-- Update performance history to reflect higher values
UPDATE copy_traders 
SET performanceHistory = '[{"month":"Jan","profit":110},{"month":"Feb","profit":118},{"month":"Mar","profit":122},{"month":"Apr","profit":124}]'
WHERE id = 'trader_vc';

-- Verify the update
SELECT name, monthlyProfit, (monthlyProfit * 100) as monthlyProfitPercent, performanceHistory 
FROM copy_traders 
WHERE id = 'trader_vc';

