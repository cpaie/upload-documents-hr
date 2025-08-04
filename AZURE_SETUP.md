# Azure AD Authentication Setup

This guide will help you set up Azure AD authentication for your React application.

## Prerequisites

1. An Azure subscription
2. Access to Azure Active Directory (Azure AD)

## Step 1: Register Your Application in Azure AD

1. **Go to Azure Portal**
   - Navigate to [Azure Portal](https://portal.azure.com)
   - Go to **Azure Active Directory** > **App registrations**

2. **Create New Registration**
   - Click **New registration**
   - Enter a name for your application (e.g., "Document Upload App")
   - Select **Accounts in this organizational directory only**
   - Click **Register**

3. **Configure Authentication**
   - Go to **Authentication** in the left menu
   - Under **Platform configurations**, click **Add a platform**
   - Select **Single-page application (SPA)**
   - Add your redirect URI: `http://localhost:3000`
   - Click **Configure**

4. **Get Your Configuration**
   - Go to **Overview** in the left menu
   - Copy the **Application (client) ID**
   - Copy the **Directory (tenant) ID**

## Step 2: Update Configuration

1. **Update `src/config/azureAuth.js`**
   ```javascript
   export const msalConfig = {
     auth: {
       clientId: "YOUR_ACTUAL_CLIENT_ID", // Replace with your Client ID
       authority: "https://login.microsoftonline.com/YOUR_ACTUAL_TENANT_ID", // Replace with your Tenant ID
       redirectUri: window.location.origin,
     },
     // ... rest of config
   };
   ```

## Step 3: Configure Scopes (Optional)

If you need additional Microsoft Graph permissions:

1. **Go to API permissions**
   - In your app registration, go to **API permissions**
   - Click **Add a permission**
   - Select **Microsoft Graph**
   - Choose the permissions you need

2. **Update scopes in `azureAuth.js`**
   ```javascript
   export const loginRequest = {
     scopes: ["User.Read", "User.ReadBasic.All"] // Add more scopes as needed
   };
   ```

## Step 4: Test the Integration

1. **Start your application**
   ```bash
   npm start
   ```

2. **Test Azure Login**
   - Click the "התחבר / הרשם" button
   - Click "התחבר עם Microsoft Azure"
   - You should be redirected to Microsoft login
   - After successful login, you'll be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application"**
   - Make sure your redirect URI in Azure matches exactly: `http://localhost:3000`

2. **"AADSTS700016: Application with identifier was not found in the directory"**
   - Check that your Client ID is correct
   - Ensure you're using the right Tenant ID

3. **"AADSTS50020: User account from a different tenant"**
   - Check that your Tenant ID is correct
   - Ensure the user belongs to the specified tenant

### Security Notes:

- Never commit your actual Client ID and Tenant ID to version control
- Use environment variables for production deployments
- Consider using Azure Key Vault for sensitive configuration

## Environment Variables (Recommended)

For production, use environment variables:

```javascript
export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.REACT_APP_AZURE_TENANT_ID}`,
    redirectUri: window.location.origin,
  },
  // ... rest of config
};
```

Create a `.env` file:
```
REACT_APP_AZURE_CLIENT_ID=your_client_id_here
REACT_APP_AZURE_TENANT_ID=your_tenant_id_here
```

## Additional Resources

- [MSAL.js Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications)
- [Azure AD App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/overview) 