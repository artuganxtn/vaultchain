# Troubleshooting 500 Error on Signup

## Step 1: Check Backend Logs (MOST IMPORTANT)

On your server, run these commands to see the actual error:

```bash
# View PM2 logs
pm2 logs vaultchain-backend --lines 50

# Or view all logs
pm2 logs vaultchain-backend

# Check for errors
pm2 logs vaultchain-backend | grep -i error
```

The logs will show the EXACT error message causing the 500 error.

---

## Common Causes & Solutions

### 1. Database Not Initialized

**Check:**
```bash
cd /var/www/vaultchain/backend
ls -la database.db
```

**Fix:**
```bash
# Database should auto-initialize on first run
# But if missing, restart backend
pm2 restart vaultchain-backend

# Check if database file was created
ls -la database.db
```

---

### 2. Missing Database Columns

**Error would be:** `SQLITE_ERROR: no such column: emailVerificationOTP`

**Fix:**
```bash
cd /var/www/vaultchain/backend

# Check database schema
sqlite3 database.db ".schema users"

# If columns missing, the migration should run automatically
# Restart backend to trigger migration
pm2 restart vaultchain-backend
pm2 logs vaultchain-backend --lines 20
```

---

### 3. Database Permissions Issue

**Check:**
```bash
ls -la /var/www/vaultchain/backend/database.db
```

**Fix:**
```bash
# Set correct permissions
sudo chmod 664 /var/www/vaultchain/backend/database.db
sudo chown $USER:$USER /var/www/vaultchain/backend/database.db

# Also check logs directory
sudo chmod 775 /var/www/vaultchain/backend/logs
```

---

### 4. Missing Dependencies

**Check:**
```bash
cd /var/www/vaultchain/backend
npm list --depth=0
```

**Fix:**
```bash
# Reinstall dependencies
cd /var/www/vaultchain/backend
npm install --production

# Restart backend
pm2 restart vaultchain-backend
```

---

### 5. Environment Variables Not Set

**Check:**
```bash
cd /var/www/vaultchain/backend
cat .env
```

**Ensure .env has:**
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://vaultchaintr.com
```

---

### 6. Email Service Error

**If email sending fails and crashes the app:**

**Check backend code handles email errors gracefully** (it should, but verify):
- The signup should continue even if email fails
- Check logs for email errors

---

## Quick Diagnostic Commands

Run these on your server:

```bash
# 1. Check backend is running
pm2 status

# 2. View recent logs
pm2 logs vaultchain-backend --lines 100

# 3. Check database exists
ls -la /var/www/vaultchain/backend/database.db

# 4. Test database connection
cd /var/www/vaultchain/backend
node -e "const db = require('./database'); db.initDb().then(() => console.log('DB OK')).catch(e => console.error(e));"

# 5. Check file permissions
ls -la /var/www/vaultchain/backend/

# 6. Test API directly
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","username":"testuser","email":"test@test.com","password":"test1234","phone":"+1234567890","country":"US","address":"Test"}'
```

---

## Most Likely Issues (Based on Your Setup)

### Issue 1: Database Migration Not Run

**Fix:**
```bash
cd /var/www/vaultchain/backend
pm2 restart vaultchain-backend
pm2 logs vaultchain-backend
# Look for migration messages
```

### Issue 2: Missing Columns in Database

The database schema migration should run automatically. If not:

```bash
cd /var/www/vaultchain/backend
sqlite3 database.db "ALTER TABLE users ADD COLUMN emailVerificationOTP TEXT;"
sqlite3 database.db "ALTER TABLE users ADD COLUMN emailVerificationOTPExpires TEXT;"
pm2 restart vaultchain-backend
```

---

## Get the Exact Error

**Run this command and share the output:**

```bash
pm2 logs vaultchain-backend --lines 100 --nostream | tail -50
```

This will show the exact error message that's causing the 500 error.

---

## After Fixing

```bash
# Restart backend
pm2 restart vaultchain-backend

# Check logs
pm2 logs vaultchain-backend --lines 20

# Test signup again
```

