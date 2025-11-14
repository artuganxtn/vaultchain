# Update VaultChain Official Monthly Profit to 124%

## Option 1: Using SQLite Command Line (Recommended)

If you have access to the database file directly:

```bash
sqlite3 backend/database.db "UPDATE copy_traders SET monthlyProfit = 1.24 WHERE id = 'trader_vc';"
```

## Option 2: Using the Update Script

Make sure backend dependencies are installed first:

```bash
cd backend
npm install
node update-trader-profit.js
```

## Option 3: Using the API Endpoint

The API endpoint has been enhanced to support updating monthlyProfit:

```bash
curl -X PUT http://localhost:3001/api/copy-traders/trader_vc \
  -H "Content-Type: application/json" \
  -d '{"monthlyProfit": 1.24}'
```

Or from the frontend/admin panel, you can now update trader profits through the API.

## Verification

To verify the update:

```bash
sqlite3 backend/database.db "SELECT name, monthlyProfit FROM copy_traders WHERE id = 'trader_vc';"
```

Expected result: `monthlyProfit` should be `1.24` (which displays as 124% in the UI).

