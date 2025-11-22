<<<<<<< HEAD
const { sendPasswordResetOTP } = require('./services/emailService');

// Test SMTP connection
async function testSMTP() {
    console.log('\n========================================');
    console.log('🧪 Testing SMTP Connection');
    console.log('========================================\n');
    
    // Get email from command line argument or use default
    const testEmail = process.argv[2] || 'bnbn1@gmx.fr';
    
    console.log(`📧 Testing email sending to: ${testEmail}`);
    console.log('⏳ Sending test email...\n');
    
    try {
        const result = await sendPasswordResetOTP(testEmail, '123456', 'en');
        
        if (result.success) {
            console.log('\n✅ ========================================');
            console.log('✅ SMTP TEST SUCCESSFUL!');
            console.log('✅ ========================================');
            console.log(`✅ Email sent successfully to: ${testEmail}`);
            console.log(`✅ Message ID: ${result.messageId}`);
            console.log(`✅ Response: ${result.response}`);
            console.log('\n✅ Check your inbox (and spam folder) for the test email.');
            console.log('✅ OTP Code in email should be: 123456');
            console.log('✅ ========================================\n');
            process.exit(0);
        } else {
            console.log('\n❌ ========================================');
            console.log('❌ SMTP TEST FAILED!');
            console.log('❌ ========================================');
            console.log(`❌ Error: ${result.error}`);
            console.log(`❌ Error Code: ${result.code || 'N/A'}`);
            if (result.response) {
                console.log(`❌ SMTP Response: ${result.response}`);
            }
            console.log('❌ ========================================\n');
            process.exit(1);
        }
    } catch (error) {
        console.log('\n❌ ========================================');
        console.log('❌ SMTP TEST FAILED WITH EXCEPTION!');
        console.log('❌ ========================================');
        console.error('❌ Error:', error.message);
        console.error('❌ Stack:', error.stack);
        console.log('❌ ========================================\n');
        process.exit(1);
    }
}

// Run the test
testSMTP();

=======
const { sendPasswordResetOTP } = require('./services/emailService');

// Test SMTP connection
async function testSMTP() {
    console.log('\n========================================');
    console.log('🧪 Testing SMTP Connection');
    console.log('========================================\n');
    
    // Get email from command line argument or use default
    const testEmail = process.argv[2] || 'bnbn1@gmx.fr';
    
    console.log(`📧 Testing email sending to: ${testEmail}`);
    console.log('⏳ Sending test email...\n');
    
    try {
        const result = await sendPasswordResetOTP(testEmail, '123456', 'en');
        
        if (result.success) {
            console.log('\n✅ ========================================');
            console.log('✅ SMTP TEST SUCCESSFUL!');
            console.log('✅ ========================================');
            console.log(`✅ Email sent successfully to: ${testEmail}`);
            console.log(`✅ Message ID: ${result.messageId}`);
            console.log(`✅ Response: ${result.response}`);
            console.log('\n✅ Check your inbox (and spam folder) for the test email.');
            console.log('✅ OTP Code in email should be: 123456');
            console.log('✅ ========================================\n');
            process.exit(0);
        } else {
            console.log('\n❌ ========================================');
            console.log('❌ SMTP TEST FAILED!');
            console.log('❌ ========================================');
            console.log(`❌ Error: ${result.error}`);
            console.log(`❌ Error Code: ${result.code || 'N/A'}`);
            if (result.response) {
                console.log(`❌ SMTP Response: ${result.response}`);
            }
            console.log('❌ ========================================\n');
            process.exit(1);
        }
    } catch (error) {
        console.log('\n❌ ========================================');
        console.log('❌ SMTP TEST FAILED WITH EXCEPTION!');
        console.log('❌ ========================================');
        console.error('❌ Error:', error.message);
        console.error('❌ Stack:', error.stack);
        console.log('❌ ========================================\n');
        process.exit(1);
    }
}

// Run the test
testSMTP();

>>>>>>> 8cf7b9904c0e59190db7233e79357b9d9ab0b44b
