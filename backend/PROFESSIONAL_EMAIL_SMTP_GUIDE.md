# Guide: Finding SMTP Details for Professional Email (vaultchain.com)

Since you have a professional email with the vaultchain domain, here's how to find your SMTP details based on your email provider.

## Step 1: Identify Your Email Provider

Your email provider depends on where you purchased/set up your email. Common providers:

1. **cPanel** (Most hosting providers)
2. **Google Workspace** (formerly G Suite)
3. **Microsoft 365** (formerly Office 365)
4. **Zoho Mail**
5. **Hosting provider** (Many providers have their own email service)

---

## Method 1: cPanel / Web Hosting Provider (Most Common)

If you access your email through cPanel or your hosting provider's control panel:

### Finding SMTP Details:

1. **Login to cPanel** or your hosting control panel
2. **Go to "Email Accounts"** or "Email" section
3. **Click on your email address** (e.g., support@vaultchain.com)
4. **Look for "Email Client Configuration"** or **"Configure Mail Client"**
5. **Select "Manual Settings"** or **"IMAP/POP3"**
6. **Find the SMTP settings** - They usually look like:

```
SMTP Host: mail.vaultchain.com (or smtp.vaultchain.com)
SMTP Port: 587 (or 465 for SSL)
SMTP Username: support@vaultchain.com (your full email)
SMTP Password: [your email password]
```

### Common cPanel SMTP Settings:

```env
SMTP_HOST=mail.vaultchain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchain.com
SMTP_PASSWORD=your-email-password
```

**If port 587 doesn't work, try:**
- Port `465` with `SMTP_SECURE=true`
- Port `25` (less common, may be blocked)

---

## Method 2: Google Workspace (G Suite)

If your email is managed through Google Workspace:

### SMTP Settings:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchain.com
SMTP_PASSWORD=your-app-password
```

### Getting Google Workspace App Password:

1. Go to [Google Account Settings](https://admin.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. At the bottom, click **App passwords**
4. Generate a password for "Mail"
5. Use this password (not your regular password) as `SMTP_PASSWORD`

---

## Method 3: Microsoft 365 (Office 365)

If your email is through Microsoft 365:

### SMTP Settings:

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchain.com
SMTP_PASSWORD=your-email-password
```

**Note:** Make sure you're using your full email address as the username.

---

## Method 4: Zoho Mail

If you're using Zoho Mail:

### SMTP Settings:

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchain.com
SMTP_PASSWORD=your-email-password
```

---

## Method 5: Generic Email Hosting (Provider-Specific)

### Steps to Find SMTP Details:

1. **Check your hosting provider's documentation**
   - Search for "[Your Provider] SMTP settings"
   - Common providers: Bluehost, HostGator, SiteGround, GoDaddy, etc.

2. **Check your welcome email**
   - Many providers send SMTP details in the welcome email

3. **Contact support**
   - Ask: "What are the SMTP settings for my email account?"

4. **Common SMTP Host Formats:**
   - `mail.yourdomain.com`
   - `smtp.yourdomain.com`
   - `mail.hostingprovider.com`
   - Your hosting provider's mail server

---

## Quick Test: Finding Your SMTP Server

### Option A: Check Your Email Client Settings

If you already have the email set up in Outlook, Thunderbird, or Apple Mail:

1. **Outlook:**
   - File → Account Settings → Account Settings
   - Select your account → Change
   - Look at "Outgoing mail server"

2. **Apple Mail (Mac):**
   - Mail → Preferences → Accounts
   - Select account → Account Information
   - Look at "Outgoing Mail Server (SMTP)"

3. **Thunderbird:**
   - Account Settings → Outgoing Server (SMTP)
   - Check server name and port

### Option B: DNS Lookup

You can also check your domain's DNS records:

1. Go to [MXToolbox](https://mxtoolbox.com/)
2. Enter `vaultchain.com`
3. Look for MX records - these often point to your mail server
4. The mail server name is usually your SMTP host

---

## Common SMTP Configuration Examples

### For Most Hosting Providers (cPanel):

```env
SMTP_HOST=mail.vaultchain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchain.com
SMTP_PASSWORD=your-email-password
```

### Alternative (if 587 doesn't work):

```env
SMTP_HOST=mail.vaultchain.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@vaultchain.com
SMTP_PASSWORD=your-email-password
```

### If Your Provider Uses a Different Server:

```env
SMTP_HOST=smtp.hosting-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchain.com
SMTP_PASSWORD=your-email-password
```

---

## Testing Your SMTP Settings

After configuring, test it:

1. **Start your server**: `node backend/server.js`
2. **Check console output**:
   - ✅ `Email service is ready` = Success!
   - ❌ `Email configuration error` = Check your settings

3. **Request a password reset** from your app
4. **Check if email arrives** in the inbox

---

## Troubleshooting Common Issues

### "Authentication failed"
- ✅ Use your full email address (support@vaultchain.com) as username
- ✅ Double-check your password (case-sensitive)
- ✅ For Google Workspace, use App Password, not regular password
- ✅ Some providers require you to enable "Less secure app access"

### "Connection timeout"
- ✅ Check if SMTP port (587) is open
- ✅ Try port 465 with SMTP_SECURE=true
- ✅ Check firewall settings
- ✅ Verify SMTP_HOST is correct

### "Server not found"
- ✅ Try `mail.vaultchain.com` first
- ✅ Try `smtp.vaultchain.com`
- ✅ Contact your hosting provider for exact SMTP hostname

### Port 587 vs 465
- **Port 587**: STARTTLS (use SMTP_SECURE=false)
- **Port 465**: SSL/TLS (use SMTP_SECURE=true)
- Try both if one doesn't work

---

## Still Can't Find It?

### Contact Your Hosting Provider

Ask them this:

> "Hi, I need the SMTP settings for my email account (support@vaultchain.com). Could you provide:
> - SMTP server/host
> - SMTP port
> - Security type (TLS/SSL)
> - Username format
> 
> Thank you!"

They should provide all the details you need!

---

## Quick Reference: Common Providers

| Provider | SMTP Host | Port | Secure |
|----------|-----------|------|--------|
| cPanel/Generic | mail.yourdomain.com | 587 | false |
| Google Workspace | smtp.gmail.com | 587 | false |
| Microsoft 365 | smtp.office365.com | 587 | false |
| Zoho | smtp.zoho.com | 587 | false |
| Bluehost | mail.bluehost.com | 587 | false |
| HostGator | mail.hostgator.com | 587 | false |

---

## Final Configuration Example

Once you have the details, create `backend/.env`:

```env
SMTP_HOST=mail.vaultchain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=support@vaultchain.com
SMTP_PASSWORD=YourSecurePassword123!
```

Save, restart server, and you're done! 🎉

