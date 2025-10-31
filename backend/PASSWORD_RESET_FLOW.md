# Password Reset Flow - Complete Guide

## Overview

The password reset system uses **secure links** instead of codes. When a user requests a password reset:

1. A secure token is generated and stored in the database
2. An email is sent with a clickable reset link
3. User clicks the link → token is verified → password reset form appears
4. User enters new password → password is reset → token is cleared

## Complete Flow

### Step 1: User Requests Reset

**Frontend:** User enters email/username and clicks "Send Reset Link"

**Backend:**
- Validates user exists
- Generates secure 32-byte hex token
- Stores token in `passwordResetCode` field
- Sets expiration (1 hour from now)
- Sends email with reset link

**Email Contains:**
- Clickable "Reset Password" button
- Copy-paste link as backup
- Expiration notice (1 hour)

### Step 2: User Clicks Link

**URL Format:** `https://your-domain.com/?token=abc123...`

**Frontend:**
- Detects token in URL query parameter
- Shows `ResetPasswordPage` component
- Automatically verifies token with backend
- Shows user's email if token is valid
- Shows error if token is invalid/expired

**Backend Verification:**
- Checks if token exists
- Verifies token hasn't expired
- Returns user email if valid

### Step 3: User Resets Password

**Frontend:** User enters new password (twice for confirmation)

**Backend:**
- Validates token again
- Checks expiration
- Updates password
- Clears reset token (prevents reuse)
- Returns success

**Frontend:** Shows success message → Redirects to login after 3 seconds

## Configuration

### Environment Variables

Add to `backend/.env`:

```env
# Frontend URL (for reset links)
FRONTEND_URL=https://vaultchain.com

# Or for local development:
# FRONTEND_URL=http://localhost:3000
```

**Important:** Set `FRONTEND_URL` to your production domain in production!

### Email Configuration

See `EMAIL_SETUP.md` for SMTP configuration.

## Security Features

✅ **Secure Token Generation:** Uses `crypto.randomBytes(32)` for cryptographically secure tokens

✅ **Token Expiration:** Links expire after 1 hour

✅ **One-Time Use:** Token is cleared after successful password reset

✅ **User Enumeration Protection:** Always returns success, even if user doesn't exist

✅ **Token Verification:** Token is verified both when clicking link AND when submitting new password

✅ **HTTPS in Production:** Links should use HTTPS in production

## Testing the Flow

### Test Request Reset:

1. Go to login page
2. Click "Forgot Password"
3. Enter your email
4. Click "Send Reset Link"

**Expected:**
- Success message: "Password reset link has been sent to your email"
- Check email inbox (or server console if email not configured)

### Test Clicking Link:

1. Open the reset link from email
2. Should see "Reset Your Password" form
3. Should see your email address displayed

**Expected:**
- Form appears with your email
- No errors

### Test Resetting Password:

1. Enter new password (8+ characters)
2. Confirm password
3. Click "Reset Password"

**Expected:**
- Success message
- Redirect to login after 3 seconds
- Can login with new password

## Troubleshooting

### Link Doesn't Work

**Check:**
- `FRONTEND_URL` is set correctly in `.env`
- Link format: `https://your-domain.com/?token=...`
- Token hasn't expired (1 hour limit)
- Token wasn't already used

### Email Not Received

**Check:**
- SMTP configuration in `.env`
- Spam/junk folder
- Server console for email status
- Email address is correct

### "Invalid or Expired Token"

**Possible Causes:**
- Token expired (>1 hour old)
- Token already used
- Token doesn't exist in database
- URL was modified/corrupted

**Solution:** Request a new reset link

### Link Opens but Shows Error

**Check:**
- Backend server is running
- API endpoint `/auth/verify-reset-token/:token` is accessible
- Network connection
- Browser console for errors

## API Endpoints

### Request Reset
```
POST /api/auth/request-reset
Body: { "identifier": "user@example.com" }
Response: { "success": true }
```

### Verify Token
```
GET /api/auth/verify-reset-token/:token
Response: { "success": true, "email": "user@example.com" }
```

### Reset Password
```
POST /api/auth/reset-password
Body: { "token": "abc123...", "newPassword": "newpass123" }
Response: { "success": true }
```

## Production Checklist

- [ ] Set `FRONTEND_URL` in `.env` to production domain
- [ ] Configure SMTP settings for email sending
- [ ] Test reset flow end-to-end
- [ ] Ensure HTTPS is enabled
- [ ] Verify email deliverability
- [ ] Test on mobile devices (link should work)
- [ ] Check spam folder behavior

## Example Reset Link

**Development:**
```
http://localhost:3000/?token=a1b2c3d4e5f6...
```

**Production:**
```
https://vaultchain.com/?token=a1b2c3d4e5f6...
```

The token is a 64-character hexadecimal string (32 bytes = 64 hex chars).

---

That's the complete password reset flow! 🎉
