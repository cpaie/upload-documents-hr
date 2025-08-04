// Test script to verify webhook configuration
// Run this with: node test-webhook.js

const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('Please create a .env file with your webhook configuration.');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return envVars;
}

// Test webhook configuration
async function testWebhook() {
  console.log('🔍 Testing Webhook Configuration...\n');
  
  const envVars = loadEnvFile();
  
  // Check required variables
  const webhookUrl = envVars.REACT_APP_WEBHOOK_URL;
  const apiKey = envVars.REACT_APP_WEBHOOK_API_KEY;
  
  console.log('📋 Configuration Check:');
  console.log(`   Webhook URL: ${webhookUrl ? '✅ Set' : '❌ Not set'}`);
  console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ Not set'}`);
  
  if (!webhookUrl || !apiKey) {
    console.log('\n❌ Missing required configuration!');
    console.log('Please set both REACT_APP_WEBHOOK_URL and REACT_APP_WEBHOOK_API_KEY in your .env file.');
    return;
  }
  
  console.log('\n🌐 Testing Webhook Connection...');
  
  try {
    // Create a simple test payload
    const testData = {
      test: true,
      timestamp: new Date().toISOString(),
      message: 'This is a test from the webhook verification script'
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-make-apikey': apiKey
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response OK: ${response.ok ? '✅' : '❌'}`);
    
    if (response.ok) {
      console.log('✅ Webhook test successful! Your Make.com webhook is working.');
    } else {
      console.log('❌ Webhook test failed. Please check your Make.com webhook configuration.');
      const errorText = await response.text();
      console.log(`   Error details: ${errorText}`);
    }
    
  } catch (error) {
    console.log('❌ Webhook test failed with error:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('Failed to fetch')) {
      console.log('\n💡 Possible solutions:');
      console.log('   1. Check if your webhook URL is correct');
      console.log('   2. Verify your API key is valid');
      console.log('   3. Make sure your Make.com webhook is active');
      console.log('   4. Check for CORS restrictions');
    }
  }
}

// Run the test
testWebhook().catch(console.error); 