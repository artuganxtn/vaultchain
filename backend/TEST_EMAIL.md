# How to Test Email Configuration

This guide shows you exactly how to test if your SMTP email setup is working correctly.

## Quick Test Steps

### Step 1: Check Server Startup

1. **Start your server:**
   ```bash
   cd backend
   node server.js
   ```

2. **Look for this message in the console:**
   - ✅ `Email service is ready` = **Email is configured and working!**
   - ⚠️ `Email not configured. Using console mode.` = Check your `.env` file

### Step 2: Test Password Reset Flow

1. **Start your frontend** (if not already running)

2. **Navigate to login page**

3. **Click "Forgot Password"** or similar link

4. **Enter your email address** (the one you configured in `.env`)

5. **Click "Send Code"**

### Step 3: Check Results

#### If Email is Configured:
- ✅ Check your email inbox for the reset code
- ✅ Check spam/junk folder if not in inbox
- ✅ Look for email from "VaultChain" with subject "Password Reset Code"
- ✅ The email should contain a 6-digit code

#### If Email is NOT Configured:
- ✅ Check the server console output
- ✅ You'll see something like:
  ```
  ========================================
  📧 [EMAIL - Development Mode]
  To: your-email@example.com
  Your password reset code is: 123456
  ========================================
  ```

### Step 4: Complete the Reset

1. **Enter the 6-digit code** you received (from email or console)

2. **Enter your new password**

3. **Confirm the new password**

4. **Click "Reset Password"**

5. **You should see a success message**

6. **Try logging in with your new password** to verify it worked!

---

## Method 1: Using the Application (Recommended)

### Test the Full Password Reset Flow:

1. **Start Backend Server:**
   ```bash
   cd backend
   node server.js
   ```
   
2. **Start Frontend** (in another terminal):
   ```bash
   npm run dev
   ```

3. **Open your browser** and go to the login page

4. **Click "Forgot Password"**

5. **Enter your email address**

6. **Click "Send Code"**

7. **Check where you get the code:**
   - If email configured: Check email inbox
   - If not configured: Check server console

8. **Enter the code and reset your password**

9. **Login with new password** to confirm it worked

---

## Method 2: Direct API Test (Advanced)

You can test the email sending directly via API:

### Test Request Password Reset:

```bash
curl -X POST http://localhost:3001/api/auth/request-reset \
  -H "Content-Type: application/json" \
  -d '{"identifier":"your-email@vaultchain.com"}'
```

**Expected Response:**
```json
{"success": true}
```

**Then check:**
- Your email inbox (if configured)
- Server console (if not configured)

---

## Method 3: Using a Test Script

I'll create a test script for you (see below).

---

## What to Look For

### ✅ Success Indicators:

**Server Console:**
```
Database initialized successfully.
✅ Email service is ready
Server is listening on port 3001
```

**When requesting reset:**
```
✅ Password reset email sent successfully to your-email@vaultchain.com
   Message ID: <xxx@xxx.com>
```

**Email Inbox:**
- Subject: "Password Reset Code - VaultChain"
- Professional HTML email with your code
- 6-digit code clearly displayed

### ❌ Failure Indicators:

**Server Console:**
```
⚠️ Email not configured. Using console mode.
```

**Or:**
```
❌ Error sending password reset email: [error message]
```

**Common Errors:**
- `Authentication failed` = Wrong username/password
- `Connection timeout` = Wrong SMTP host or port blocked
- `Server not found` = Wrong SMTP_HOST value

---

## Troubleshooting

### Email Not Sending?

1. **Check `.env` file exists:**
   ```bash
   cat backend/.env
   ```
   
2. **Verify all 5 variables are set:**
   - SMTP_HOST
   - SMTP_PORT
   - SMTP_SECURE
   - SMTP_USER
   - SMTP_PASSWORD

3. **Check for typos:**
   - No spaces around `=` sign
   - No quotes around values
   - Correct email address format

4. **Restart the server** after editing `.env`

5. **Check server console** for error messages

### Email Goes to Spam?

1. Check spam/junk folder
2. Add sender to contacts
3. For production, configure SPF/DKIM records

### Authentication Failed?

**For Gmail/Google Workspace:**
- Use App Password, not regular password
- Enable 2-Step Verification first

**For Domain Email:**
- Use full email address as username (support@vaultchain.com)
- Double-check password is correct
- Some providers require enabling "Less secure apps"

### Connection Timeout?

1. Try port 465 with `SMTP_SECURE=true`
2. Check if firewall is blocking the port
3. Verify SMTP_HOST is correct
4. Try `smtp.vaultchain.com` instead of `mail.vaultchain.com`

---

## Quick Test Checklist

- [ ] Server starts without errors
- [ ] Console shows "Email service is ready" OR "Email not configured"
- [ ] Password reset request succeeds
- [ ] Reset code received (email or console)
- [ ] Can complete password reset with code
- [ ] Can login with new password

---

## Test Email Addresses

**To Test Safely:**

1. **Use a test email** you control
2. **Don't test with production user accounts**
3. **Use your personal email** for initial testing
4. **Once working, test with domain email**

---

## Still Having Issues?

1. **Check the detailed guides:**
   - `PROFESSIONAL_EMAIL_SMTP_GUIDE.md` - For domain email setup
   - `EMAIL_SETUP.md` - General email setup
   - `SMTP_SETUP_GUIDE.md` - Quick setup reference

2. **Contact your hosting provider** for SMTP settings

3. **Try using a dedicated email service** like SendGrid for testing

---

## Expected Console Output

### When Email is Configured:

```
Database initialized successfully.
✅ Email service is ready
Server is listening on port 3001
[API] POST /api/auth/request-reset
✅ Password reset email sent successfully to support@vaultchain.com
   Message ID: <abc123@mail.vaultchain.com>
```

### When Email is NOT Configured:

```
Database initialized successfully.
⚠️  Email not configured. Using console mode.
   Password reset codes will be displayed in the console during development.
   To enable email sending, set SMTP environment variables (see emailService.js).
Server is listening on port 3001
[API] POST /api/auth/request-reset

========================================
📧 [EMAIL - Development Mode]
To: support@vaultchain.com
Subject: Password Reset Code - VaultChain

Hello User,

Your password reset code is: 123456
This code will expire in 10 minutes.
========================================
```

---

That's it! You should now be able to test your email configuration! 🎉

