# Email Setup Guide for Password Reset

This guide explains how to configure email sending for the password reset feature.

## Quick Start (Development Mode)

**Without any configuration, the system will work in "console mode"** - password reset codes will be displayed in the server console. This is perfect for development and testing.

## Production Setup

To enable real email sending, you need to configure SMTP settings via environment variables.

### ⚠️ Gmail SMTP Limits (Important!)

**Gmail has strict sending limits:**
- **Free Gmail accounts**: 100 emails per day
- **Google Workspace accounts**: 2,000 emails per day
- **Rate limit**: ~500 emails per hour (can vary)
- **Recipients per email**: Maximum 100 recipients

**⚠️ For production, Gmail is NOT recommended** if you expect:
- More than 100 password resets per day
- High volume of transactional emails
- Professional email delivery

**Recommendation**: Use a dedicated transactional email service for production (see options below).

### Option 1: Gmail (For Testing & Low Volume Only)

**Best for**: Development, testing, small projects (< 50 users/day)

1. **Enable 2-Step Verification** on your Gmail account
2. **Generate an App Password**:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Set Environment Variables**:
   ```bash
   export SMTP_HOST=smtp.gmail.com
   export SMTP_PORT=587
   export SMTP_SECURE=false
   export SMTP_USER=your-email@gmail.com
   export SMTP_PASSWORD=your-app-password-here
   ```

### Option 2: Outlook/Hotmail

```bash
export SMTP_HOST=smtp-mail.outlook.com
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=your-email@outlook.com
export SMTP_PASSWORD=your-password
```

### Option 3: Custom SMTP Server

```bash
export SMTP_HOST=your-smtp-server.com
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=your-email@domain.com
export SMTP_PASSWORD=your-password
```

### Option 4: Professional Email Services (Recommended for Production)

#### SendGrid (Free tier: 100 emails/day, paid from $15/month)

```bash
export SMTP_HOST=smtp.sendgrid.net
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=apikey
export SMTP_PASSWORD=your-sendgrid-api-key
```

#### Mailgun (Free tier: 5,000 emails/month)

```bash
export SMTP_HOST=smtp.mailgun.org
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=postmaster@your-domain.mailgun.org
export SMTP_PASSWORD=your-mailgun-password
```

#### AWS SES (Very affordable, pay per email)

```bash
export SMTP_HOST=email-smtp.us-east-1.amazonaws.com
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=your-ses-smtp-username
export SMTP_PASSWORD=your-ses-smtp-password
```

#### Postmark (Free tier: 100 emails/month, paid from $15/month)

```bash
export SMTP_HOST=smtp.postmarkapp.com
export SMTP_PORT=587
export SMTP_SECURE=false
export SMTP_USER=your-postmark-server-token
export SMTP_PASSWORD=your-postmark-server-token
```

### Option 5: Using a .env File

Create a `.env` file in the `backend` directory:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

Then install `dotenv` and load it:
```bash
npm install dotenv
```

And in `server.js`:
```javascript
require('dotenv').config();
```

## Security Notes

- **Never commit SMTP credentials to version control**
- Use App Passwords instead of your main account password
- For production, use dedicated transactional email services:
  - **SendGrid** - Great for startups, 100 free/day
  - **Mailgun** - 5,000 free/month, excellent deliverability
  - **AWS SES** - Very affordable ($0.10 per 1,000 emails)
  - **Postmark** - Excellent for transactional emails
  - **Resend** - Modern API-first service

## Comparison: Gmail vs Professional Services

| Feature | Gmail (Free) | Google Workspace | SendGrid | Mailgun | AWS SES |
|---------|--------------|------------------|----------|---------|---------|
| Daily Limit | 100 | 2,000 | 100 free, unlimited paid | 5,000/month free | Pay per use |
| Best For | Testing | Small businesses | Startups | Growing apps | Enterprise |
| Deliverability | Good | Good | Excellent | Excellent | Excellent |
| Cost | Free | $6/user/month | Free tier, $15+/mo | Free tier, pay per use | $0.10/1K emails |

## Testing

1. Start the server
2. Check the console output - it will tell you if email is configured
3. Try requesting a password reset
4. If email is configured, check the recipient inbox
5. If not configured, check the server console for the reset code

## Troubleshooting

### "Email configuration error"

- Check your SMTP credentials
- For Gmail, make sure "Less secure app access" is enabled OR use App Password
- Check firewall/network settings
- Verify SMTP server and port

### Emails going to spam

- Use a professional email service
- Configure SPF and DKIM records for your domain
- Use a custom domain email address

## Current Status

The email service automatically detects if it's configured:
- ✅ **Configured**: Emails are sent to users
- ⚠️ **Not Configured**: Reset codes are logged to console (development mode)

