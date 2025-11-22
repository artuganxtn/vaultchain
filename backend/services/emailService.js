const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
// GoDaddy SMTP configuration - smtpout.secureserver.net
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // GoDaddy uses STARTTLS on port 587, not SSL/TLS
    requireTLS: true, // Force TLS upgrade
    auth: {
        user: process.env.SMTP_USER || 'support@vaultchaintr.store',
        pass: process.env.SMTP_PASSWORD || 'Aqwzsxedc123@'
    },
    tls: {
        // Do not fail on invalid certificates (for development)
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    debug: true, // Enable debug output
    logger: true // Enable logging
});

// Verify connection configuration on startup
transporter.verify(function (error, success) {
    if (error) {
        console.error('[Email Service] ❌ SMTP connection verification failed:');
        console.error('[Email Service] Error code:', error.code);
        console.error('[Email Service] Error command:', error.command);
        console.error('[Email Service] Error message:', error.message);
    } else {
        console.log('[Email Service] ✅ SMTP server is ready to send emails');
    }
});

/**
 * Send password reset OTP email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} language - Language code (en, ar, tr)
 * @returns {Promise<Object>}
 */
const sendPasswordResetOTP = async (email, otp, language = 'en') => {
    const translations = {
        en: {
            subject: 'VaultChain - Password Reset Code',
            greeting: 'Hello,',
            message: 'You have requested to reset your password. Use the following verification code:',
            codeLabel: 'Your verification code is:',
            codeExpiry: 'This code will expire in 10 minutes.',
            securityNote: 'If you did not request this password reset, please ignore this email or contact our support team.',
            footer: 'Thank you for using VaultChain.',
            support: 'Support Team'
        },
        ar: {
            subject: 'VaultChain - رمز إعادة تعيين كلمة المرور',
            greeting: 'مرحباً،',
            message: 'لقد طلبت إعادة تعيين كلمة المرور. استخدم رمز التحقق التالي:',
            codeLabel: 'رمز التحقق الخاص بك هو:',
            codeExpiry: 'سينتهي صلاحية هذا الرمز خلال 10 دقائق.',
            securityNote: 'إذا لم تطلب إعادة تعيين كلمة المرور هذه، يرجى تجاهل هذا البريد الإلكتروني أو الاتصال بفريق الدعم لدينا.',
            footer: 'شكراً لاستخدام VaultChain.',
            support: 'فريق الدعم'
        },
        tr: {
            subject: 'VaultChain - Şifre Sıfırlama Kodu',
            greeting: 'Merhaba,',
            message: 'Şifrenizi sıfırlamak için bir istekte bulundunuz. Aşağıdaki doğrulama kodunu kullanın:',
            codeLabel: 'Doğrulama kodunuz:',
            codeExpiry: 'Bu kod 10 dakika içinde sona erecek.',
            securityNote: 'Bu şifre sıfırlama isteğini siz yapmadıysanız, lütfen bu e-postayı yok sayın veya destek ekibimizle iletişime geçin.',
            footer: 'VaultChain kullandığınız için teşekkürler.',
            support: 'Destek Ekibi'
        }
    };

    const t = translations[language] || translations.en;

    const htmlContent = `
<!DOCTYPE html>
<html dir="${language === 'ar' ? 'rtl' : 'ltr'}" lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            color: #10b981;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .otp-box {
            background-color: #f0fdf4;
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #10b981;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
        }
        .security-note {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">VaultChain</div>
        </div>
        
        <p>${t.greeting}</p>
        
        <p>${t.message}</p>
        
        <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">${t.codeLabel}</p>
            <div class="otp-code">${otp}</div>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">${t.codeExpiry}</p>
        
        <div class="security-note">
            <strong>⚠️ ${t.securityNote}</strong>
        </div>
        
        <div class="footer">
            <p>${t.footer}</p>
            <p>${t.support}<br>VaultChain Team</p>
        </div>
    </div>
</body>
</html>
    `;

    const textContent = `
${t.greeting}

${t.message}

${t.codeLabel} ${otp}

${t.codeExpiry}

${t.securityNote}

${t.footer}
${t.support}
VaultChain Team
    `;

    const mailOptions = {
        from: `"VaultChain Support" <${process.env.SMTP_USER || 'support@vaultchaintr.store'}>`,
        to: email,
        subject: t.subject,
        text: textContent,
        html: htmlContent
    };

    try {
        console.log(`\n[Email Service] ========================================`);
        console.log(`[Email Service] 📧 Attempting to send password reset OTP`);
        console.log(`[Email Service] To: ${email}`);
        console.log(`[Email Service] OTP: ${otp}`);
        console.log(`[Email Service] Language: ${language}`);
        console.log(`[Email Service] SMTP Host: ${process.env.SMTP_HOST || 'smtpout.secureserver.net'}`);
        console.log(`[Email Service] SMTP Port: ${process.env.SMTP_PORT || '587'}`);
        console.log(`[Email Service] SMTP User: ${process.env.SMTP_USER || 'support@vaultchaintr.store'}`);
        console.log(`[Email Service] ========================================\n`);
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log(`\n[Email Service] ✅ ========================================`);
        console.log(`[Email Service] EMAIL SENT SUCCESSFULLY!`);
        console.log(`[Email Service] To: ${email}`);
        console.log(`[Email Service] Message ID: ${info.messageId}`);
        console.log(`[Email Service] Response: ${info.response}`);
        console.log(`[Email Service] Accepted: ${info.accepted}`);
        console.log(`[Email Service] Rejected: ${info.rejected}`);
        console.log(`[Email Service] OTP Code: ${otp}`);
        console.log(`[Email Service] ========================================\n`);
        
        return { success: true, messageId: info.messageId, response: info.response };
    } catch (error) {
        console.error(`\n[Email Service] ❌ ========================================`);
        console.error('[Email Service] FAILED TO SEND EMAIL');
        console.error(`[Email Service] To: ${email}`);
        console.error(`[Email Service] Error Code: ${error.code || 'N/A'}`);
        console.error(`[Email Service] Error Command: ${error.command || 'N/A'}`);
        console.error(`[Email Service] Error Message: ${error.message}`);
        if (error.response) {
            console.error(`[Email Service] SMTP Response: ${error.response}`);
        }
        if (error.responseCode) {
            console.error(`[Email Service] SMTP Response Code: ${error.responseCode}`);
        }
        console.error(`[Email Service] OTP Code (for manual testing): ${otp}`);
        console.error('[Email Service] Full Error Object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.error('[Email Service] ========================================\n');
        return { success: false, error: error.message, code: error.code, response: error.response };
    }
};

module.exports = {
    sendPasswordResetOTP
};
