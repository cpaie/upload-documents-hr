// Test Azure Authentication and OneDrive Connectivity
// Run with: node test-azure-auth.js

// Use built-in fetch for Node.js 18+
// const fetch = require('node-fetch'); // Remove this line

// Configuration - Replace with your values
const config = {
  clientId: '0e489b27-1a2f-48c0-a772-63bc61e6a8a9',
  clientSecret: '0-L8Q~tSkOPV8~WFHDMin_gik~vcakutuLJYua1P',
  tenantId: '22fde68e-d975-441b-a414-73ff55b29824',
  redirectUri: 'http://localhost:3000'
};

// Test 1: Get Access Token
async function getAccessToken() {
  console.log('🔐 Testing Azure Authentication...');
  
  const tokenUrl = `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token request failed: ${response.status} - ${error}`);
    }

    const tokenData = await response.json();
    console.log('✅ Access token obtained successfully');
    console.log(`   Token type: ${tokenData.token_type}`);
    console.log(`   Expires in: ${tokenData.expires_in} seconds`);
    
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ Failed to get access token:', error.message);
    return null;
  }
}

// Test 2: Get Application Info (for client credentials flow)
async function getApplicationInfo(accessToken) {
  console.log('\n👤 Testing Application Info...');
  
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/applications', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Application info request failed: ${response.status} - ${error}`);
    }

    const appData = await response.json();
    console.log('✅ Application info retrieved successfully');
    console.log(`   Found ${appData.value.length} applications`);
    
    // Find our app
    const ourApp = appData.value.find(app => app.appId === config.clientId);
    if (ourApp) {
      console.log(`   Our app: ${ourApp.displayName}`);
      console.log(`   App ID: ${ourApp.appId}`);
    }
    
    return appData;
  } catch (error) {
    console.error('❌ Failed to get application info:', error.message);
    return null;
  }
}

// Test 3: List OneDrive Files (for specific user)
async function listOneDriveFiles(accessToken) {
  console.log('\n📁 Testing OneDrive Access...');
  
  // For client credentials flow, we need to specify a user
  // You'll need to replace 'USER_EMAIL_OR_ID' with an actual user
  const userId = 'USER_EMAIL_OR_ID'; // Replace with actual user email or ID
  
  try {
    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userId}/drive/root/children?$top=5`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OneDrive request failed: ${response.status} - ${error}`);
    }

    const driveData = await response.json();
    console.log('✅ OneDrive access successful');
    console.log(`   Found ${driveData.value.length} items in root folder`);
    
    if (driveData.value.length > 0) {
      console.log('   Sample files:');
      driveData.value.slice(0, 3).forEach(item => {
        console.log(`     - ${item.name} (${item.size || 'folder'} bytes)`);
      });
    }
    
    return driveData;
  } catch (error) {
    console.error('❌ Failed to access OneDrive:', error.message);
    console.log('   Note: For client credentials flow, you need to specify a user ID or email');
    return null;
  }
}

// Test 4: Create Test Folder (for specific user)
async function createTestFolder(accessToken) {
  console.log('\n📂 Testing Folder Creation...');
  
  // For client credentials flow, we need to specify a user
  const userId = 'USER_EMAIL_OR_ID'; // Replace with actual user email or ID
  
  const testFolderName = `test-upload-${Date.now()}`;
  const folderData = {
    name: testFolderName,
    folder: {},
    '@microsoft.graph.conflictBehavior': 'rename'
  };

  try {
    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userId}/drive/root/children`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(folderData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Folder creation failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Test folder created successfully');
    console.log(`   Folder name: ${result.name}`);
    console.log(`   Folder ID: ${result.id}`);
    console.log(`   Web URL: ${result.webUrl}`);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to create test folder:', error.message);
    console.log('   Note: For client credentials flow, you need to specify a user ID or email');
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Azure/OneDrive Connectivity Tests\n');
  
  // Test 1: Authentication
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.log('\n❌ Authentication failed. Please check your configuration.');
    return;
  }
  
  // Test 2: Application Info
  const appInfo = await getApplicationInfo(accessToken);
  if (!appInfo) {
    console.log('\n❌ Application info test failed.');
    return;
  }
  
  // Test 3: OneDrive Access
  const driveInfo = await listOneDriveFiles(accessToken);
  if (!driveInfo) {
    console.log('\n❌ OneDrive access test failed.');
    return;
  }
  
  // Test 4: Folder Creation
  const testFolder = await createTestFolder(accessToken);
  if (!testFolder) {
    console.log('\n❌ Folder creation test failed.');
    return;
  }
  
  console.log('\n🎉 All tests passed! Your Azure/OneDrive setup is working correctly.');
  console.log('\n📋 Next steps:');
  console.log('1. Update your .env file with the working credentials');
  console.log('2. Implement the OneDrive upload in your React app');
  console.log('3. Test with actual file uploads');
}

// Run tests if this file is executed directly
if (require.main === module) {
  // Check if configuration is provided
  if (config.clientId === 'YOUR_CLIENT_ID_HERE') {
    console.log('❌ Please update the configuration in this file with your Azure app credentials.');
    console.log('   - clientId: Your Azure app client ID');
    console.log('   - clientSecret: Your Azure app client secret');
    console.log('   - tenantId: Your Azure tenant ID');
    process.exit(1);
  }
  
  runTests().catch(console.error);
}

module.exports = { getAccessToken, getApplicationInfo, listOneDriveFiles, createTestFolder }; 