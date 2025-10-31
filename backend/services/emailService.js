const nodemailer = require('nodemailer');

// Email configuration - can be overridden by environment variables
const EMAIL_CONFIG = {
    // For Gmail/Google Workspace: use 'smtp.gmail.com'
    // For Outlook/Microsoft 365: use 'smtp.office365.com'
    // For cPanel/hosting: use 'mail.yourdomain.com' (e.g., 'mail.vaultchain.com')
    // For custom SMTP: use your SMTP server
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465 (SSL), false for 587 (TLS/STARTTLS)
    auth: {
        user: process.env.SMTP_USER || '', // Your full email address (e.g., support@vaultchain.com)
        pass: process.env.SMTP_PASSWORD || '' // Your email password or app-specific password
    }
};

// Create reusable transporter object using the default SMTP transport
let transporter = null;

const initTransporter = () => {
    // Only initialize if we have email credentials
    if (EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass) {
        transporter = nodemailer.createTransport({
            host: EMAIL_CONFIG.host,
            port: EMAIL_CONFIG.port,
            secure: EMAIL_CONFIG.secure,
            auth: EMAIL_CONFIG.auth,
            // For Gmail, you might need to enable "Less secure app access" or use App Password
            // For better security, use OAuth2 or App Passwords
            // NOTE: Gmail has limits - 100 emails/day (free) or 2,000/day (Workspace)
            // For production, consider using SendGrid, Mailgun, AWS SES, or Postmark
        });
        return true;
    }
    return false;
};

// Initialize transporter on module load
const emailConfigured = initTransporter();

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetLink - Password reset link
 * @param {string} userName - User's name (optional)
 * @param {string} token - Reset token (for fallback display)
 * @returns {Promise<boolean>} - Success status
 */
const sendPasswordResetEmail = async (to, resetLink, userName = '', token = '') => {
    // If email is not configured, log to console (development mode)
    if (!emailConfigured || !transporter) {
        console.log(`\n========================================`);
        console.log(`📧 [EMAIL - Development Mode]`);
        console.log(`To: ${to}`);
        console.log(`Subject: Password Reset - VaultChain`);
        console.log(`\nHello ${userName || 'User'},`);
        console.log(`\nClick this link to reset your password:`);
        console.log(`${resetLink}`);
        console.log(`\nThis link will expire in 1 hour.`);
        console.log(`\nIf you didn't request this, please ignore this message.`);
        console.log(`\n========================================\n`);
        return true; // Return true so the user experience isn't broken in development
    }

    try {
        const mailOptions = {
            from: `"VaultChain" <${EMAIL_CONFIG.auth.user}>`,
            to: to,
            subject: 'Reset Your Password - VaultChain',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
                        .button:hover { opacity: 0.9; }
                        .link-text { word-break: break-all; color: #10b981; font-size: 12px; margin-top: 10px; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>VaultChain</h1>
                        </div>
                        <div class="content">
                            <h2>Reset Your Password</h2>
                            <p>Hello ${userName || 'User'},</p>
                            <p>You have requested to reset your password. Click the button below to create a new password:</p>
                            <div style="text-align: center;">
                                <a href="${resetLink}" class="button" style="color: white; text-decoration: none;">Reset Password</a>
                            </div>
                            <p class="link-text">Or copy and paste this link into your browser:<br>${resetLink}</p>
                            <p><strong>This link will expire in 1 hour.</strong></p>
                            <p>If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
                            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                            <p style="font-size: 12px; color: #6b7280;">This is an automated message. Please do not reply to this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} VaultChain. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Reset Your Password - VaultChain

Hello ${userName || 'User'},

You have requested to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email. Your account remains secure.

---
This is an automated message. Please do not reply to this email.
            `.trim()
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent successfully to ${to}`);
        console.log(`   Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        // Still log the code for development purposes
        console.log(`[FALLBACK] Password reset code for ${to} is: ${resetCode}`);
        // Return false so we know the email failed
        return false;
    }
};

// Verify email configuration
const verifyEmailConfig = async () => {
    if (!emailConfigured || !transporter) {
        return { configured: false, message: 'Email not configured. Using console mode.' };
    }

    try {
        await transporter.verify();
        return { configured: true, message: 'Email service is ready' };
    } catch (error) {
        return { configured: false, message: `Email configuration error: ${error.message}` };
    }
};

/**
 * Send email verification OTP
 * @param {string} to - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name (optional)
 * @returns {Promise<boolean>} - Success status
 */
const sendVerificationOTPEmail = async (to, otp, userName = '') => {
    // If email is not configured, log to console (development mode)
    if (!emailConfigured || !transporter) {
        console.log(`\n========================================`);
        console.log(`📧 [EMAIL - Development Mode]`);
        console.log(`To: ${to}`);
        console.log(`Subject: Verify Your Email - VaultChain`);
        console.log(`\nHello ${userName || 'User'},`);
        console.log(`\nYour email verification code is: ${otp}`);
        console.log(`This code will expire in 10 minutes.`);
        console.log(`\nEnter this code to complete your registration.`);
        console.log(`\nIf you didn't create this account, please ignore this message.`);
        console.log(`\n========================================\n`);
        return true; // Return true so the user experience isn't broken in development
    }

    try {
        const mailOptions = {
            from: `"VaultChain" <${EMAIL_CONFIG.auth.user}>`,
            to: to,
            subject: 'Verify Your Email - VaultChain',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .code-box { background: white; border: 3px solid #10b981; border-radius: 12px; padding: 25px; text-align: center; margin: 25px 0; font-size: 42px; font-weight: bold; color: #10b981; letter-spacing: 8px; font-family: 'Courier New', monospace; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to VaultChain!</h1>
                        </div>
                        <div class="content">
                            <h2>Verify Your Email Address</h2>
                            <p>Hello ${userName || 'User'},</p>
                            <p>Thank you for signing up! To complete your registration, please enter the verification code below:</p>
                            <div class="code-box">${otp}</div>
                            <p><strong>This code will expire in 10 minutes.</strong></p>
                            <p>If you didn't create an account with VaultChain, please ignore this email.</p>
                            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                            <p style="font-size: 12px; color: #6b7280;">This is an automated message. Please do not reply to this email.</p>
                        </div>
                        <div class="footer">
                            <p>&copy; ${new Date().getFullYear()} VaultChain. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
Welcome to VaultChain!

Hello ${userName || 'User'},

Thank you for signing up! To complete your registration, please enter the verification code below:

${otp}

This code will expire in 10 minutes.

If you didn't create an account with VaultChain, please ignore this email.

---
This is an automated message. Please do not reply to this email.
            `.trim()
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Verification OTP email sent successfully to ${to}`);
        console.log(`   Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending verification OTP email:', error);
        // Still log the OTP for development purposes
        console.log(`[FALLBACK] Verification OTP for ${to} is: ${otp}`);
        return false;
    }
};

module.exports = {
    sendPasswordResetEmail,
    sendVerificationOTPEmail,
    verifyEmailConfig,
    emailConfigured
};

