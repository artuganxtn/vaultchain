const { dbGet, dbRun } = require('../database');
const crypto = require('crypto');
const { sendPasswordResetEmail, sendVerificationOTPEmail } = require('../services/emailService');

const generateUUID = () => {
  return crypto.randomUUID();
};

exports.login = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const user = await dbGet(`SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?`, [identifier, identifier, password]);
        if (user) {
            // Check if user needs to verify email (PendingOTP status)
            if (user.status === 'PendingOTP') {
                return res.status(403).json({ message: 'Email verification required', error: 'emailVerificationRequired' });
            }
            // Parse JSON fields
            user.permissions = JSON.parse(user.permissions || '{}');
            user.referrals = JSON.parse(user.referrals || '[]');
            user.portfolio = JSON.parse(user.portfolio || '[]');
            user.kycDocuments = JSON.parse(user.kycDocuments || '{}');
            user.notification = JSON.parse(user.notification || 'null');
            res.json(user);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.signUp = async (req, res) => {
    const { fullName, username, email, password, phone, country, address, referralCode } = req.body;
    try {
        const existingEmail = await dbGet(`SELECT id FROM users WHERE email = ?`, [email]);
        if (existingEmail) return res.status(400).json({ error: 'accountExistsError' });

        const existingUsername = await dbGet(`SELECT id FROM users WHERE username = ?`, [username]);
        if (existingUsername) return res.status(400).json({ error: 'usernameExistsError' });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

        const newUser = {
            id: generateUUID(),
            name: fullName,
            username,
            phone,
            email,
            password,
            role: 'USER',
            status: 'PendingOTP', // New status for pending OTP verification
            balance: 0,
            onHoldBalance: 0,
            invested: 0,
            welcomeBonus: 0,
            createdAt: new Date().toISOString(),
            walletAddress: `0x${Math.random().toString(16).substr(2, 12)}`,
            accountNumber: `547${Math.floor(10000 + Math.random() * 90000).toString()}`,
            country,
            address,
            referralCode: `${username.toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
            referredBy: referralCode,
            referrals: '[]',
            isAgent: false,
            referralBonus: 0,
            totalDeposits: 0,
            depositBonusUsed: false,
            activePlanId: null,
            unclaimedProfit: 0,
            agentLevel: 0,
            portfolio: '[]',
            isFeeExempt: false,
            emailVerificationOTP: otp,
            emailVerificationOTPExpires: otpExpires
        };
        
        await dbRun(`INSERT INTO users (id, name, username, phone, email, password, role, status, balance, onHoldBalance, invested, welcomeBonus, createdAt, walletAddress, accountNumber, country, address, referralCode, referredBy, referrals, isAgent, referralBonus, totalDeposits, depositBonusUsed, activePlanId, unclaimedProfit, agentLevel, portfolio, isFeeExempt, emailVerificationOTP, emailVerificationOTPExpires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, Object.values(newUser));
        
        // Send OTP email
        const emailSent = await sendVerificationOTPEmail(email, otp, fullName);
        if (!emailSent) {
            console.warn(`⚠️ Email sending failed for ${email}, but OTP has been generated.`);
        }
        
        // Handle referrer (only if user verifies email later)
        // We'll handle this in the verifyOTP function
        
        // Return success with email (no sensitive data)
        res.status(201).json({ 
            success: true, 
            email: email,
            message: 'OTP sent to your email. Please verify to complete registration.'
        });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Verify OTP and activate account
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await dbGet(`SELECT * FROM users WHERE email = ?`, [email]);
        
        if (!user) {
            return res.status(404).json({ success: false, error: 'userNotFound' });
        }
        
        // Check if OTP matches and hasn't expired
        if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp) {
            return res.status(400).json({ success: false, error: 'invalidOTP' });
        }
        
        if (new Date() > new Date(user.emailVerificationOTPExpires)) {
            return res.status(400).json({ success: false, error: 'expiredOTP' });
        }
        
        // Check if already verified
        if (user.status !== 'PendingOTP') {
            return res.status(400).json({ success: false, error: 'alreadyVerified' });
        }
        
        // Activate account: change status to Unverified (ready for KYC) and clear OTP
        await dbRun(`UPDATE users SET status = ?, emailVerificationOTP = NULL, emailVerificationOTPExpires = NULL WHERE id = ?`, ['Unverified', user.id]);
        
        // Handle referrer now that account is verified
        if (user.referredBy) {
            const referrer = await dbGet(`SELECT * FROM users WHERE referralCode = ?`, [user.referredBy]);
            if (referrer) {
                const referrals = JSON.parse(referrer.referrals || '[]');
                referrals.push({ userId: user.id, status: 'registered' });
                await dbRun(`UPDATE users SET referrals = ? WHERE id = ?`, [JSON.stringify(referrals), referrer.id]);
            }
        }
        
        // Get updated user
        const updatedUser = await dbGet(`SELECT * FROM users WHERE id = ?`, [user.id]);
        if (updatedUser) {
            // Parse JSON fields
            updatedUser.permissions = JSON.parse(updatedUser.permissions || '{}');
            updatedUser.referrals = JSON.parse(updatedUser.referrals || '[]');
            updatedUser.portfolio = JSON.parse(updatedUser.portfolio || '[]');
            updatedUser.kycDocuments = JSON.parse(updatedUser.kycDocuments || '{}');
            updatedUser.notification = JSON.parse(updatedUser.notification || 'null');
        }
        
        res.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await dbGet(`SELECT id, name, email, status FROM users WHERE email = ?`, [email]);
        
        if (!user) {
            // For security, don't reveal if user exists
            return res.json({ success: true });
        }
        
        // Only allow resend if status is PendingOTP
        if (user.status !== 'PendingOTP') {
            return res.json({ success: true }); // Return success for security
        }
        
        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        
        // Update OTP in database
        await dbRun(`UPDATE users SET emailVerificationOTP = ?, emailVerificationOTPExpires = ? WHERE id = ?`, [otp, otpExpires, user.id]);
        
        // Send new OTP email
        const emailSent = await sendVerificationOTPEmail(user.email, otp, user.name);
        if (!emailSent) {
            console.warn(`⚠️ Email sending failed for ${user.email}, but OTP has been generated.`);
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Resend OTP error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    const { identifier } = req.body;
    try {
        const user = await dbGet(`SELECT id, email, name FROM users WHERE email = ? OR username = ?`, [identifier, identifier]);
        if (user) {
            // Generate secure token using crypto
            const resetToken = crypto.randomBytes(32).toString('hex');
            const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiration
            
            await dbRun(`UPDATE users SET passwordResetCode = ?, passwordResetCodeExpires = ? WHERE id = ?`, [resetToken, expires, user.id]);
            
            // Get frontend URL from environment or use default
            // For production, set FRONTEND_URL in .env file (e.g., https://vaultchain.com)
            const frontendUrl = process.env.FRONTEND_URL || 'https://vaultchaintr.com';
            const resetLink = `${frontendUrl}/?token=${resetToken}`;
            
            console.log(`🔗 Generated reset link for ${user.email}: ${resetLink}`);
            
            // Send email with reset link
            const emailSent = await sendPasswordResetEmail(user.email, resetLink, user.name, resetToken);
            
            if (!emailSent) {
                console.warn(`⚠️ Email sending failed for ${user.email}, but reset token has been generated.`);
            }
        } else {
            // For security, always return success even if user doesn't exist
            // This prevents user enumeration attacks
        }
        res.json({ success: true });
    } catch (err) {
        console.error('Error in requestPasswordReset:', err);
        res.status(500).json({ message: err.message });
    }
};

// Verify reset token (used when user clicks the link)
exports.verifyResetToken = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await dbGet(`SELECT id, email FROM users WHERE passwordResetCode = ? AND passwordResetCodeExpires > ?`, [token, new Date().toISOString()]);
        if (!user) {
            return res.status(400).json({ success: false, error: 'invalidOrExpiredToken' });
        }
        res.json({ success: true, email: user.email });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Reset password with token (from link)
exports.resetPasswordWithToken = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await dbGet(`SELECT * FROM users WHERE passwordResetCode = ?`, [token]);
        
        if (!user) {
            return res.status(400).json({ success: false, error: 'invalidToken' });
        }
        
        if (new Date() > new Date(user.passwordResetCodeExpires)) {
            return res.status(400).json({ success: false, error: 'expiredToken' });
        }
        
        // Update password and clear reset token
        await dbRun(`UPDATE users SET password = ?, passwordResetCode = NULL, passwordResetCodeExpires = NULL WHERE id = ?`, [newPassword, user.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};