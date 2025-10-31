# Gmail SMTP Limits - Quick Reference

## Daily Sending Limits

| Account Type | Daily Limit | Hourly Limit (approx) |
|--------------|-------------|----------------------|
| **Free Gmail** | **100 emails/day** | ~500 emails/hour |
| **Google Workspace** | **2,000 emails/day** | ~500 emails/hour |

## Important Notes

### ❌ What Gmail SMTP is NOT good for:
- High-volume transactional emails
- Marketing campaigns
- Bulk email sending
- Production apps with >100 users/day needing password resets
- Professional email delivery (lower deliverability than dedicated services)

### ✅ What Gmail SMTP IS good for:
- Development and testing
- Small projects with <50 password resets/day
- Personal projects
- Learning/prototyping

## What Happens if You Exceed Limits?

1. **Temporary suspension**: Your account may be temporarily blocked from sending
2. **Bounce backs**: Emails may bounce with error messages
3. **Account warnings**: Google may flag your account for review
4. **Permanent restrictions**: Repeated violations can result in permanent limits

## Production Alternatives

### Recommended Services (All have free tiers):

1. **SendGrid** 
   - Free: 100 emails/day forever
   - Paid: $15/month for 40,000 emails
   - Best for: Startups, small businesses

2. **Mailgun**
   - Free: 5,000 emails/month
   - Paid: $0.80 per 1,000 emails
   - Best for: Growing applications

3. **AWS SES**
   - Free: 62,000 emails/month (if on EC2)
   - Paid: $0.10 per 1,000 emails
   - Best for: AWS users, enterprise

4. **Postmark**
   - Free: 100 emails/month
   - Paid: $15/month for 10,000 emails
   - Best for: Transactional emails only

5. **Resend**
   - Modern API-first service
   - Free tier available
   - Best for: Modern applications

## Migration Path

If you're currently using Gmail and hitting limits:

1. **Immediate**: Switch to a service with a free tier (SendGrid or Mailgun)
2. **Long-term**: Monitor your email volume and upgrade when needed
3. **Enterprise**: Consider AWS SES for large-scale operations

## Configuration Examples

See `EMAIL_SETUP.md` for detailed configuration instructions for each service.

