// Simple OneDrive Connectivity Test
// Run with: node test-onedrive-simple.js

// Configuration - Replace with your values
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
    console.log(`   Token type: ${tokenData.token_type}`);
    console.log(`   Expires in: ${tokenData.expires_in} seconds`);
    
    return tokenData.access_token;
  } catch (error) {
    console.error('❌ Failed to get access token:', error.message);
    return null;
  }
}

// Test OneDrive Access (you'll need to provide a user email/ID)
async function testOneDriveAccess(accessToken, userEmail = null) {
  console.log('\n📁 Testing OneDrive Access...');
  
  if (!userEmail) {
    console.log('⚠️  No user email provided. Please provide a user email to test OneDrive access.');
    console.log('   Usage: node test-onedrive-simple.js user@yourdomain.com');
    return false;
  }
  
  try {
    // Test listing files
    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userEmail}/drive/root/children?$top=3`, {
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
    console.log('✅ OneDrive access successful!');
    console.log(`   User: ${userEmail}`);
    console.log(`   Found ${driveData.value.length} items in root folder`);
    
    if (driveData.value.length > 0) {
      console.log('   Sample files:');
      driveData.value.forEach(item => {
        console.log(`     - ${item.name} (${item.size || 'folder'} bytes)`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to access OneDrive:', error.message);
    return false;
  }
}

// Test File Upload (you'll need to provide a user email/ID)
async function testFileUpload(accessToken, userEmail = null) {
  console.log('\n📤 Testing File Upload...');
  
  if (!userEmail) {
    console.log('⚠️  No user email provided. Skipping file upload test.');
    return false;
  }
  
  try {
    // Create a simple test file content
    const testContent = 'This is a test file created by the OneDrive API test.';
    const fileName = `test-file-${Date.now()}.txt`;
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userEmail}/drive/root:/${fileName}:/content`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain'
      },
      body: testContent
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`File upload failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ File upload successful!');
    console.log(`   File name: ${result.name}`);
    console.log(`   File ID: ${result.id}`);
    console.log(`   Web URL: ${result.webUrl}`);
    
    return result;
  } catch (error) {
    console.error('❌ Failed to upload file:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting OneDrive Connectivity Test\n');
  
  // Get access token
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.log('\n❌ Authentication failed. Please check your configuration.');
    return;
  }
  
  // Get user email from command line arguments
  const userEmail = process.argv[2];
  
  // Test OneDrive access
  const oneDriveSuccess = await testOneDriveAccess(accessToken, userEmail);
  
  // Test file upload
  const uploadSuccess = await testFileUpload(accessToken, userEmail);
  
  if (oneDriveSuccess && uploadSuccess) {
    console.log('\n🎉 All tests passed! Your OneDrive setup is working correctly.');
    console.log('\n📋 Next steps:');
    console.log('1. Update your .env file with the working credentials');
    console.log('2. Implement the OneDrive upload in your React app');
    console.log('3. Test with actual PDF files');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { getAccessToken, testOneDriveAccess, testFileUpload }; 