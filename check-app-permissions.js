// Check App Permissions
// Run with: node check-app-permissions.js

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

// Check what permissions the app has
async function checkAppPermissions(accessToken) {
  console.log('\n🔍 Checking App Permissions...');
  
  try {
    // First, get the app registration details
    const appResponse = await fetch(`https://graph.microsoft.com/v1.0/applications?$filter=appId eq '${config.clientId}'&$select=id,appId,displayName,requiredResourceAccess`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!appResponse.ok) {
      const error = await appResponse.text();
      console.log(`❌ Failed to get app registration: ${appResponse.status} - ${error}`);
      return;
    }

    const appData = await appResponse.json();
    console.log('✅ App registration info retrieved');
    
    if (appData.value.length === 0) {
      console.log('❌ App not found in applications');
      return;
    }

    const app = appData.value[0];
    console.log(`\n📋 App Details:`);
    console.log(`   Display Name: ${app.displayName}`);
    console.log(`   App ID: ${app.appId}`);
    console.log(`   Application ID: ${app.id}`);

    // Check required resource access (permissions configured)
    if (app.requiredResourceAccess && app.requiredResourceAccess.length > 0) {
      console.log(`\n🔐 Configured Permissions (${app.requiredResourceAccess.length} resources):`);
      
      for (const resource of app.requiredResourceAccess) {
        console.log(`\n   📦 Resource: ${resource.resourceAppId}`);
        
        if (resource.resourceAccess && resource.resourceAccess.length > 0) {
          console.log(`   🔑 Access Types:`);
          resource.resourceAccess.forEach(access => {
            const type = access.type === 'Role' ? 'Application Permission' : 'Delegated Permission';
            console.log(`      - ${type}: ${access.id}`);
          });
        } else {
          console.log(`   ❌ No access configured for this resource`);
        }
      }
    } else {
      console.log('\n❌ No permissions configured in app registration');
    }

    // Now check the service principal for granted permissions
    console.log('\n🔍 Checking Service Principal for Granted Permissions...');
    const spResponse = await fetch(`https://graph.microsoft.com/v1.0/servicePrincipals?$filter=appId eq '${config.clientId}'&$select=id,appId,displayName,appRoles,oauth2PermissionScopes`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (spResponse.ok) {
      const spData = await spResponse.json();
      if (spData.value.length > 0) {
        const sp = spData.value[0];
        console.log(`   Service Principal ID: ${sp.id}`);
        
        // Check delegated permissions
        if (sp.oauth2PermissionScopes && sp.oauth2PermissionScopes.length > 0) {
          console.log(`\n🔑 Delegated Permissions (${sp.oauth2PermissionScopes.length}):`);
          sp.oauth2PermissionScopes.forEach(scope => {
            console.log(`   - ${scope.value} (${scope.adminConsentDescription})`);
          });
        } else {
          console.log('\n🔑 Delegated Permissions: None');
        }

        // Check application permissions
        if (sp.appRoles && sp.appRoles.length > 0) {
          console.log(`\n🔐 Application Permissions (${sp.appRoles.length}):`);
          sp.appRoles.forEach(role => {
            console.log(`   - ${role.value} (${role.displayName})`);
          });
        } else {
          console.log('\n🔐 Application Permissions: None');
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking permissions:', error.message);
  }
}

// Check if admin consent was granted
async function checkAdminConsent(accessToken) {
  console.log('\n👑 Checking Admin Consent...');
  
  try {
    const response = await fetch(`https://graph.microsoft.com/v1.0/oauth2PermissionGrants?$filter=clientId eq '${config.clientId}'`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.log(`❌ Failed to check admin consent: ${response.status} - ${error}`);
      return;
    }

    const data = await response.json();
    console.log(`✅ Found ${data.value.length} permission grants`);
    
    if (data.value.length > 0) {
      data.value.forEach(grant => {
        console.log(`   - Scope: ${grant.scope}`);
        console.log(`   - Resource: ${grant.resourceId}`);
      });
    } else {
      console.log('❌ No permission grants found - admin consent may not be granted');
    }

  } catch (error) {
    console.error('❌ Error checking admin consent:', error.message);
  }
}

// Main function
async function runCheck() {
  console.log('🚀 Starting App Permission Check\n');
  
  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.log('\n❌ Authentication failed.');
    return;
  }
  
  await checkAppPermissions(accessToken);
  await checkAdminConsent(accessToken);
  
  console.log('\n📋 Next Steps:');
  console.log('1. If no application permissions are shown, add them in Azure Portal');
  console.log('2. If permissions exist but no grants, grant admin consent');
  console.log('3. Wait 5-10 minutes for changes to propagate');
}

if (require.main === module) {
  runCheck().catch(console.error);
}

module.exports = { getAccessToken, checkAppPermissions, checkAdminConsent }; 