# Fix: Another instance of Certbot is already running

## Quick Fix

Run these commands on your server:

```bash
# 1. Check if Certbot is actually running
ps aux | grep certbot

# 2. Kill any stuck Certbot processes
sudo pkill -f certbot

# 3. Remove Certbot lock files
sudo rm -f /var/lib/letsencrypt/.certbot.lock
sudo rm -f /tmp/certbot-*.lock

# 4. Wait a few seconds
sleep 2

# 5. Now try Certbot again
sudo certbot --nginx -d vaultchaintr.com -d www.vaultchaintr.com
```

## Alternative: If the above doesn't work

```bash
# Check for any Python processes related to Certbot
ps aux | grep python | grep certbot

# Kill them if found
sudo killall -9 certbot
sudo killall -9 python3

# Remove all lock files
sudo find /tmp -name "*certbot*" -type f -delete
sudo rm -rf /var/lib/letsencrypt/.certbot.lock

# Wait
sleep 3

# Try again
sudo certbot --nginx -d vaultchaintr.com -d www.vaultchaintr.com
```

## If you still get the error

Check the log file mentioned in the error:
```bash
cat /tmp/certbot-log-bl5ajfuv/log
```

Or run Certbot with verbose output:
```bash
sudo certbot --nginx -d vaultchaintr.com -d www.vaultchaintr.com -v
```

