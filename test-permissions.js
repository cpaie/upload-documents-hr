// Test Azure App Permissions
// Run with: node test-permissions.js

// Configuration
const config = {
  clientId: '0e489b27-1a2f-48c0-a772-63bc61e6a8a9',
  clientSecret: '0-L8Q~tSkOPV8~WFHDMin_gik~vcakutuLJYua1P',
  tenantId: '22fde68e-d975-441b-a414-73ff55b29824'
};

// Get Access Token
async function getAccessToken() {
  console.log('🔐 Getting Azure Access Token...');
  
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
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ Failed to get access token:', error.message);
    return null;
  }
}

// Test different Graph API endpoints to identify permission issues
async function testPermissions(accessToken) {
  console.log('\n🔍 Testing API Permissions...');
  
  const tests = [
    {
      name: 'Users List',
      url: 'https://graph.microsoft.com/v1.0/users?$top=1',
      description: 'Tests User.Read.All permission'
    },
    {
      name: 'User Profile',
      url: 'https://graph.microsoft.com/v1.0/users/dudy@cpaie.co.il',
      description: 'Tests User.Read.All permission for specific user'
    },
    {
      name: 'OneDrive Root',
      url: 'https://graph.microsoft.com/v1.0/users/dudy@cpaie.co.il/drive/root',
      description: 'Tests Files.ReadWrite.All permission'
    },
    {
      name: 'OneDrive Children',
      url: 'https://graph.microsoft.com/v1.0/users/dudy@cpaie.co.il/drive/root/children?$top=1',
      description: 'Tests Files.ReadWrite.All permission for listing files'
    }
  ];

  for (const test of tests) {
    console.log(`\n📋 Testing: ${test.name}`);
    console.log(`   Description: ${test.description}`);
    
    try {
      const response = await fetch(test.url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('   ✅ SUCCESS');
      } else {
        const error = await response.text();
        console.log(`   ❌ FAILED (${response.status})`);
        console.log(`   Error: ${error.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }
}

// Main function
async function runPermissionTest() {
  console.log('🚀 Starting Azure Permission Test\n');
  
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.log('\n❌ Authentication failed.');
    return;
  }
  
  await testPermissions(accessToken);
  
  console.log('\n📋 Permission Analysis:');
  console.log('If you see ❌ FAILED for OneDrive tests, you need:');
  console.log('1. Files.ReadWrite.All (Application permission)');
  console.log('2. User.Read.All (Application permission)');
  console.log('3. Admin consent granted for these permissions');
}

if (require.main === module) {
  runPermissionTest().catch(console.error);
}

module.exports = { getAccessToken, testPermissions }; 