# Quick Guide: Where to Put SMTP Details

## ✅ Easiest Way: Create a `.env` File

**Location**: Create a file called `.env` in the `backend` directory

**File path**: `backend/.env`

### Step 1: Create the file

1. Navigate to the `backend` folder
2. Create a new file named `.env` (with the dot at the beginning)
3. Copy the template below

### Step 2: Fill in your SMTP credentials

**For Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password-here
```

**Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=john.doe@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

**For SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-api-key-here
```

**For Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

**For Professional Email (vaultchain.com domain) - Most Common:**
```env
SMTP_HOST=mail.vaultchain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchain.com
SMTP_PASSWORD=your-email-password
```

> 💡 **Note**: If you have a professional email with your domain, see `PROFESSIONAL_EMAIL_SMTP_GUIDE.md` for detailed instructions on finding your SMTP details from your hosting provider.

### Step 3: Save and restart the server

After saving the `.env` file, restart your Node.js server. The server will automatically load these settings!

## 📍 File Location Summary

```
vaultchain/
  └── backend/
      ├── .env              ← PUT YOUR SMTP DETAILS HERE
      ├── server.js
      ├── emailService.js
      └── ...
```

## ⚠️ Important Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Keep your credentials secret** - Don't share your `.env` file
3. **For Gmail**: You need an App Password, not your regular password
   - Enable 2-Step Verification first
   - Generate App Password from Google Account settings

## 🔧 Alternative: Environment Variables (Production)

If you're deploying to a server (like AWS, Heroku, etc.), set environment variables directly:

**Linux/Mac:**
```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=your-email@gmail.com
export SMTP_PASSWORD=your-app-password
```

**Windows PowerShell:**
```powershell
$env:SMTP_HOST="smtp.gmail.com"
$env:SMTP_PORT="587"
$env:SMTP_SECURE="false"
$env:SMTP_USER="your-email@gmail.com"
$env:SMTP_PASSWORD="your-app-password"
```

**Windows CMD:**
```cmd
set SMTP_HOST=smtp.gmail.com
set SMTP_PORT=587
set SMTP_SECURE=false
set SMTP_USER=your-email@gmail.com
set SMTP_PASSWORD=your-app-password
```

## ✅ How to Verify It's Working

1. Start your server: `node backend/server.js`
2. Look for this message:
   - ✅ `Email service is ready` = Email is configured correctly!
   - ⚠️ `Email not configured` = Check your `.env` file

3. Try requesting a password reset
4. If configured: Check the recipient's email inbox
5. If not configured: Check the server console for the reset code

## 🐛 Troubleshooting

**"Email not configured" message:**
- Make sure `.env` file is in the `backend` folder (same folder as `server.js`)
- Make sure there are no spaces around the `=` sign
- Make sure there are no quotes around the values (unless the value itself needs quotes)
- Restart the server after creating/editing `.env`

**Gmail "Authentication failed":**
- Make sure you're using an App Password, not your regular Gmail password
- Enable 2-Step Verification first
- Generate a new App Password from Google Account settings

## 📋 Quick Checklist

- [ ] Created `.env` file in `backend/` folder
- [ ] Added all 5 SMTP variables (HOST, PORT, SECURE, USER, PASSWORD)
- [ ] Used App Password for Gmail (not regular password)
- [ ] Restarted the server
- [ ] Checked console for "Email service is ready" message

That's it! Your SMTP details are now configured! 🎉

