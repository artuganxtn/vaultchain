// Test script to verify Gemini API key
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ API key not found in environment variables');
    console.error('Please set API_KEY or GEMINI_API_KEY in your .env file');
    process.exit(1);
}

console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
console.log('Testing API key...\n');

async function testApiKey() {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // Try models in order of preference
        const modelsToTry = [
            'gemini-1.0-pro',
            'gemini-pro',
            'gemini-1.5-pro-latest',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro',
            'gemini-1.5-flash'
        ];
        
        console.log('1. Testing available models...\n');
        
        for (const modelName of modelsToTry) {
            try {
                console.log(`   Trying: ${modelName}...`);
                const model = genAI.getGenerativeModel({ model: modelName });
                
                // Try to generate content
                const result = await model.generateContent('Say "Hello" in one word.');
                const response = await result.response;
                const text = response.text();
                
                console.log(`   ✅ ${modelName} works!`);
                console.log(`   Response: ${text}`);
                console.log(`\n✅ API key is valid and working!`);
                console.log(`✅ Recommended model to use: ${modelName}`);
                return; // Success, exit function
                
            } catch (error) {
                if (error.message && error.message.includes('404')) {
                    console.log(`   ❌ ${modelName} not available (404)`);
                } else if (error.message && error.message.includes('403')) {
                    console.log(`   ❌ ${modelName} access denied (403)`);
                } else {
                    console.log(`   ❌ ${modelName} failed: ${error.message.substring(0, 50)}...`);
                }
                // Continue to next model
            }
        }
        
        // If we get here, all models failed
        throw new Error('All models failed. API key may be invalid or models are not available.');
        
    } catch (error) {
        console.error('\n❌ Error testing API key:');
        console.error('   Message:', error.message);
        console.error('   Code:', error.code);
        console.error('   Status:', error.status);
        
        if (error.message.includes('API_KEY') || error.message.includes('API key')) {
            console.error('\n⚠️  The API key appears to be invalid or expired.');
            console.error('   Please check:');
            console.error('   1. The API key is correct');
            console.error('   2. The API key has not expired');
            console.error('   3. The API key has the necessary permissions');
        } else if (error.message.includes('quota') || error.message.includes('Quota')) {
            console.error('\n⚠️  API quota exceeded. Please check your Google Cloud billing.');
        } else if (error.message.includes('model') || error.message.includes('Model') || error.message.includes('All models failed')) {
            console.error('\n⚠️  No working models found.');
            console.error('   This could mean:');
            console.error('   1. The API key does not have access to Gemini models');
            console.error('   2. The Gemini API is not enabled for this project');
            console.error('   3. The API key has restrictions');
            console.error('\n   Please check your Google Cloud Console:');
            console.error('   - Ensure Gemini API is enabled');
            console.error('   - Check API key restrictions');
            console.error('   - Verify billing is enabled');
        }
        
        process.exit(1);
    }
}

testApiKey();

