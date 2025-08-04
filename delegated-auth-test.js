// Test Delegated Authentication (User-based permissions)
// This approach uses the user's own OneDrive permissions

// Configuration
const config = {
  clientId: '0e489b27-1a2f-48c0-a772-63bc61e6a8a9',
  tenantId: '22fde68e-d975-441b-a414-73ff55b29824',
  redirectUri: 'http://localhost:3000'
};

console.log('🚀 Delegated Authentication Test');
console.log('\n📋 This approach uses delegated authentication instead of application permissions.');
console.log('📋 It requires user consent but is often easier to set up.');
console.log('\n🔧 To set this up:');
console.log('1. Go to Azure Portal → App registrations → Your app');
console.log('2. Go to API permissions');
console.log('3. Remove any Application permissions');
console.log('4. Add Delegated permissions:');
console.log('   - Files.ReadWrite');
console.log('   - User.Read');
console.log('5. Grant admin consent');
console.log('\n🌐 Then use MSAL.js in your React app for user authentication.');
console.log('\n📚 See: https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications');

// This would be implemented in your React app like this:
/*
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: '0e489b27-1a2f-48c0-a772-63bc61e6a8a9',
    authority: 'https://login.microsoftonline.com/22fde68e-d975-441b-a414-73ff55b29824',
    redirectUri: 'http://localhost:3000'
  }
};

const msalInstance = new PublicClientApplication(msalConfig);

// Login and get access token
const loginRequest = {
  scopes: ['Files.ReadWrite', 'User.Read']
};

msalInstance.loginPopup(loginRequest).then(response => {
  // Get access token for Microsoft Graph
  msalInstance.acquireTokenSilent({
    scopes: ['https://graph.microsoft.com/Files.ReadWrite', 'https://graph.microsoft.com/User.Read'],
    account: response.account
  }).then(tokenResponse => {
    // Use tokenResponse.accessToken to call Microsoft Graph
    console.log('Access token:', tokenResponse.accessToken);
  });
});
*/

console.log('\n✅ Delegated authentication is often the easier approach for OneDrive access!'); 