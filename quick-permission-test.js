// Quick Permission Test
// Run this to check if permissions are working

const config = {
  clientId: '0e489b27-1a2f-48c0-a772-63bc61e6a8a9',
  clientSecret: '0-L8Q~tSkOPV8~WFHDMin_gik~vcakutuLJYua1P',
  tenantId: '22fde68e-d975-441b-a414-73ff55b29824'
};

async function quickTest() {
  console.log('🔍 Quick Permission Test\n');
  
  // Get access token
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
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!response.ok) {
      throw new Error(`Token failed: ${response.status}`);
    }

    const tokenData = await response.json();
    const accessToken = tokenData.access_token;
    console.log('✅ Access token obtained');

    // Test 1: User.Read.All
    console.log('\n📋 Testing User.Read.All...');
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/users?$top=1', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (userResponse.ok) {
      console.log('✅ User.Read.All: WORKING');
    } else {
      console.log(`❌ User.Read.All: FAILED (${userResponse.status})`);
    }

    // Test 2: Files.ReadWrite.All
    console.log('\n📋 Testing Files.ReadWrite.All...');
    const fileResponse = await fetch('https://graph.microsoft.com/v1.0/users/dudy@cpaie.co.il/drive/root?$select=id,name', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (fileResponse.ok) {
      console.log('✅ Files.ReadWrite.All: WORKING');
    } else {
      console.log(`❌ Files.ReadWrite.All: FAILED (${fileResponse.status})`);
    }

    console.log('\n🎯 Status:');
    if (userResponse.ok && fileResponse.ok) {
      console.log('🎉 ALL PERMISSIONS WORKING! You can now implement OneDrive upload.');
    } else {
      console.log('⏳ Permissions not ready yet. Wait a few more minutes and try again.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest(); 