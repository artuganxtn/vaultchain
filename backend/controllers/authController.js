const { dbGet, dbRun } = require('../database');
const crypto = require('crypto');
const { sendPasswordResetOTP } = require('../services/emailService');

const generateUUID = () => {
  return crypto.randomUUID();
};

// Helper to safely parse JSON strings from the database
const safeParse = (jsonString, fallback) => {
    if (!jsonString) return fallback;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error('JSON parsing error:', e);
        return fallback;
    }
};

exports.login = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const user = await dbGet(`SELECT * FROM users WHERE (email = ? OR username = ?) AND password = ?`, [identifier, identifier, password]);
        if (user) {
            // Safely parse JSON fields
            user.permissions = safeParse(user.permissions, {});
            user.referrals = safeParse(user.referrals, []);
            user.portfolio = safeParse(user.portfolio, []);
            user.kycDocuments = safeParse(user.kycDocuments, {});
            user.notification = safeParse(user.notification, null);
            res.json(user);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.signUp = async (req, res) => {
    const { fullName, username, email, password, referralCode } = req.body;
    try {
        const existingEmail = await dbGet(`SELECT id FROM users WHERE email = ?`, [email]);
        if (existingEmail) return res.status(400).json({ error: 'accountExistsError' });

        const existingUsername = await dbGet(`SELECT id FROM users WHERE username = ?`, [username]);
        if (existingUsername) return res.status(400).json({ error: 'usernameExistsError' });

        const newUser = {
            id: generateUUID(),
            name: fullName,
            username,
            phone: null,
            email,
            password,
            role: 'USER',
            status: 'Unverified',
            balance: 0,
            onHoldBalance: 0,
            invested: 0,
            welcomeBonus: 0,
            createdAt: new Date().toISOString(),
            walletAddress: `0x${crypto.randomBytes(20).toString('hex')}`,
            accountNumber: `547${Math.floor(10000 + Math.random() * 90000).toString()}`,
            country: null,
            address: null,
            lastActive: new Date().toISOString(),
            isFrozen: false,
            isBanned: false,
            permissions: '{}',
            referralCode: `${username.toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
            referredBy: referralCode || null,
            referrals: '[]',
            isAgent: false,
            referralBonus: 0,
            totalDeposits: 0,
            depositBonusUsed: false,
            activePlanId: null,
            agentLevel: 0,
            lastRewardDate: null,
            unclaimedProfit: 0,
            kycDocuments: '{}',
            kycRejectionReason: null,
            portfolio: '[]',
            passwordResetCode: null,
            passwordResetCodeExpires: null,
            investmentStartDate: null,
            isFeeExempt: false,
            notification: null
        };
        
        const columns = Object.keys(newUser).join(', ');
        const placeholders = Object.keys(newUser).map(() => '?').join(', ');
        
        await dbRun(`INSERT INTO users (${columns}) VALUES (${placeholders})`, Object.values(newUser));
        
        // Handle referrer
        if (referralCode) {
            const referrer = await dbGet(`SELECT * FROM users WHERE referralCode = ?`, [referralCode]);
            if (referrer) {
                const referrals = JSON.parse(referrer.referrals || '[]');
                referrals.push({ userId: newUser.id, status: 'registered' });
                await dbRun(`UPDATE users SET referrals = ? WHERE id = ?`, [JSON.stringify(referrals), referrer.id]);
            }
        }
        
        // Return new user object but with parsed JSON and without password
        const userForResponse = { 
            ...newUser, 
            permissions: JSON.parse(newUser.permissions),
            referrals: JSON.parse(newUser.referrals),
            portfolio: JSON.parse(newUser.portfolio),
            kycDocuments: JSON.parse(newUser.kycDocuments),
        };
        delete userForResponse.password;
        res.status(201).json(userForResponse);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    
    // Enhanced logging
    console.log(`\n\n`);
    console.log(`╔════════════════════════════════════════════════════════════╗`);
    console.log(`║  [Auth] 📧 PASSWORD RESET REQUEST RECEIVED                ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝`);
    console.log(`[Auth] Email: ${email}`);
    console.log(`[Auth] Timestamp: ${new Date().toISOString()}`);
    console.log(`[Auth] Request Body:`, JSON.stringify(req.body, null, 2));
    
    try {
        // Validate email format
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            console.log(`[Auth] ❌ Invalid email format`);
            return res.status(400).json({ success: false, error: 'invalidEmail' });
        }

        // Normalize email (lowercase, trim)
        const normalizedEmail = email.toLowerCase().trim();
        console.log(`[Auth] 🔍 Looking up user in database...`);
        console.log(`[Auth] Searching for: "${normalizedEmail}"`);
        
        // Query database
        const user = await dbGet(`SELECT id, email FROM users WHERE LOWER(TRIM(email)) = ?`, [normalizedEmail]);
        
        if (!user) {
            // Don't reveal if email exists or not for security
            console.log(`\n`);
            console.log(`╔════════════════════════════════════════════════════════════╗`);
            console.log(`║  [Auth] ⚠️  USER NOT FOUND IN DATABASE                     ║`);
            console.log(`╚════════════════════════════════════════════════════════════╝`);
            console.log(`[Auth] Email: ${normalizedEmail}`);
            console.log(`[Auth] No email sent (user not found)`);
            console.log(`[Auth] Returning success for security`);
            console.log(`\n\n`);
            return res.json({ success: true });
        }
        
        console.log(`[Auth] ✅ User found: ${user.email} (ID: ${user.id})`);

        // Generate 6-digit OTP
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
        
        console.log(`[Auth] 🔐 Generated OTP: ${resetCode}`);
        console.log(`[Auth] ⏰ Expires at: ${expires}`);
        
        // Save OTP to database
        try {
            await dbRun(`UPDATE users SET passwordResetCode = ?, passwordResetCodeExpires = ? WHERE id = ?`, [resetCode, expires, user.id]);
            console.log(`[Auth] 💾 OTP saved to database successfully`);
        } catch (dbError) {
            console.error(`[Auth] ❌ Database error saving OTP:`, dbError);
            throw dbError;
        }
        
        // Get user's language preference (default to 'en')
        const language = 'en';
        
        // Send email with OTP
        console.log(`\n`);
        console.log(`╔════════════════════════════════════════════════════════════╗`);
        console.log(`║  [Auth] 📧 SENDING PASSWORD RESET EMAIL                    ║`);
        console.log(`╚════════════════════════════════════════════════════════════╝`);
        console.log(`[Auth] To: ${user.email}`);
        console.log(`[Auth] OTP: ${resetCode}`);
        console.log(`[Auth] Language: ${language}`);
        
        const emailResult = await sendPasswordResetOTP(user.email, resetCode, language);
        
        if (!emailResult.success) {
            console.error(`\n`);
            console.error(`╔════════════════════════════════════════════════════════════╗`);
            console.error(`║  [Auth] ❌ FAILED TO SEND EMAIL                          ║`);
            console.error(`╚════════════════════════════════════════════════════════════╝`);
            console.error(`[Auth] Email: ${user.email}`);
            console.error(`[Auth] Error: ${emailResult.error}`);
            console.error(`[Auth] Error Code: ${emailResult.code || 'N/A'}`);
            console.error(`[Auth] ⚠️  OTP Code for manual testing: ${resetCode}`);
            console.error(`\n\n`);
            // Still return success to user for security
        } else {
            console.log(`\n`);
            console.log(`╔════════════════════════════════════════════════════════════╗`);
            console.log(`║  [Auth] ✅ EMAIL SENT SUCCESSFULLY!                       ║`);
            console.log(`╚════════════════════════════════════════════════════════════╝`);
            console.log(`[Auth] To: ${user.email}`);
            console.log(`[Auth] Message ID: ${emailResult.messageId || 'N/A'}`);
            console.log(`[Auth] Response: ${emailResult.response || 'N/A'}`);
            console.log(`[Auth] 🔑 OTP Code: ${resetCode}`);
            console.log(`[Auth] ⚠️  IMPORTANT: Check spam/junk folder!`);
            console.log(`\n\n`);
        }
        
        // Always return success (security best practice)
        res.json({ success: true });
        
    } catch (err) {
        console.error(`\n`);
        console.error(`╔════════════════════════════════════════════════════════════╗`);
        console.error(`║  [Auth] ❌ EXCEPTION IN PASSWORD RESET                    ║`);
        console.error(`╚════════════════════════════════════════════════════════════╝`);
        console.error(`[Auth] Error:`, err);
        console.error(`[Auth] Stack:`, err.stack);
        console.error(`\n\n`);
        res.status(500).json({ success: false, error: 'serverError' });
    }
};

exports.resetPasswordWithCode = async (req, res) => {
    const { email, code, newPassword } = req.body;
    
    console.log(`\n\n`);
    console.log(`╔════════════════════════════════════════════════════════════╗`);
    console.log(`║  [Auth] 🔐 PASSWORD RESET WITH CODE REQUEST              ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝`);
    console.log(`[Auth] Email: ${email}`);
    console.log(`[Auth] Code: ${code}`);
    console.log(`[Auth] Timestamp: ${new Date().toISOString()}`);
    
    try {
        // Validate inputs
        if (!email || !code || !newPassword) {
            console.log(`[Auth] ❌ Missing required fields`);
            return res.status(400).json({ success: false, error: 'missingFields' });
        }

        // Validate password length
        if (newPassword.length < 8) {
            console.log(`[Auth] ❌ Password too short (min 8 characters)`);
            return res.status(400).json({ success: false, error: 'passwordLengthError' });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        
        console.log(`[Auth] 🔍 Looking up user...`);
        const user = await dbGet(`SELECT * FROM users WHERE LOWER(TRIM(email)) = ?`, [normalizedEmail]);
        
        if (!user) {
            console.log(`[Auth] ❌ User not found`);
            return res.status(400).json({ success: false, error: 'invalidOrExpiredCode' });
        }

        console.log(`[Auth] ✅ User found: ${user.email} (ID: ${user.id})`);
        console.log(`[Auth] 🔍 Stored OTP: ${user.passwordResetCode || 'NULL'}`);
        console.log(`[Auth] 🔍 Provided OTP: ${code}`);
        console.log(`[Auth] 🔍 OTP Expires: ${user.passwordResetCodeExpires || 'NULL'}`);

        // Check if code matches
        if (!user.passwordResetCode || user.passwordResetCode !== code) {
            console.log(`[Auth] ❌ Invalid OTP code`);
            return res.status(400).json({ success: false, error: 'invalidOrExpiredCode' });
        }

        // Check if code has expired
        if (!user.passwordResetCodeExpires) {
            console.log(`[Auth] ❌ No expiration date set`);
            return res.status(400).json({ success: false, error: 'invalidOrExpiredCode' });
        }
        
        const now = new Date();
        const expires = new Date(user.passwordResetCodeExpires);
        if (now > expires) {
            console.log(`[Auth] ❌ OTP expired (now: ${now.toISOString()}, expires: ${expires.toISOString()})`);
            return res.status(400).json({ success: false, error: 'invalidOrExpiredCode' });
        }

        console.log(`[Auth] ✅ OTP validated successfully`);

        // Update password and clear reset code
        await dbRun(`UPDATE users SET password = ?, passwordResetCode = NULL, passwordResetCodeExpires = NULL WHERE id = ?`, [newPassword, user.id]);
        
        console.log(`[Auth] ✅ Password updated successfully`);
        console.log(`[Auth] ✅ Reset code cleared`);
        console.log(`\n\n`);
        
        res.json({ success: true });
    } catch (err) {
        console.error(`\n`);
        console.error(`╔════════════════════════════════════════════════════════════╗`);
        console.error(`║  [Auth] ❌ EXCEPTION IN PASSWORD RESET WITH CODE          ║`);
        console.error(`╚════════════════════════════════════════════════════════════╝`);
        console.error(`[Auth] Error:`, err);
        console.error(`[Auth] Stack:`, err.stack);
        console.error(`\n\n`);
        res.status(500).json({ success: false, error: 'serverError' });
    }
};