# Quick Azure AD Setup Fix

## Error: AADSTS900023 - Invalid Tenant ID

You're seeing this error because Azure AD is not properly configured. Here's how to fix it:

## Option 1: Use Environment Variables (Recommended)

1. **Create a `.env` file** in your project root:
```bash
touch .env
```

2. **Add your Azure credentials** to the `.env` file:
```
REACT_APP_AZURE_CLIENT_ID=your_actual_client_id_here
REACT_APP_AZURE_TENANT_ID=your_actual_tenant_id_here
```

3. **Restart your development server**:
```bash
npm start
```

## Option 2: Direct Configuration

1. **Open** `src/config/azureAuth.js`

2. **Replace the placeholder values**:
```javascript
export const msalConfig = {
  auth: {
    clientId: "your_actual_client_id_here", // Replace this
    authority: "https://login.microsoftonline.com/your_actual_tenant_id_here", // Replace this
    redirectUri: window.location.origin,
  },
  // ... rest of config
};
```

## How to Get Your Azure Credentials

### Step 1: Go to Azure Portal
- Visit [Azure Portal](https://portal.azure.com)
- Navigate to **Azure Active Directory** > **App registrations**

### Step 2: Create App Registration
- Click **New registration**
- Name: "Document Upload App"
- Supported account types: **Accounts in this organizational directory only**
- Click **Register**

### Step 3: Get Your Credentials
- **Client ID**: Copy from **Overview** page
- **Tenant ID**: Copy from **Overview** page (Directory ID)

### Step 4: Configure Authentication
- Go to **Authentication**
- Add platform: **Single-page application (SPA)**
- Redirect URI: `http://localhost:3000`
- Click **Configure**

## Example Configuration

```javascript
// src/config/azureAuth.js
export const msalConfig = {
  auth: {
    clientId: "12345678-1234-1234-1234-123456789012", // Your actual Client ID
    authority: "https://login.microsoftonline.com/87654321-4321-4321-4321-210987654321", // Your actual Tenant ID
    redirectUri: window.location.origin,
  },
  // ... rest of config
};
```

## Test Your Configuration

1. **Restart the app**: `npm start`
2. **Click** "התחבר / הרשם"
3. **Click** "התחבר עם Microsoft Azure"
4. **You should see** Microsoft login page (not an error)

## Common Issues

- **Wrong Client ID**: Double-check the Application (client) ID
- **Wrong Tenant ID**: Double-check the Directory (tenant) ID
- **Redirect URI mismatch**: Must be exactly `http://localhost:3000`
- **App not configured**: Make sure you added SPA platform in Authentication

## Need Help?

If you still get errors, check:
1. Azure portal app registration is complete
2. Authentication platform is configured
3. Redirect URI matches exactly
4. Client ID and Tenant ID are correct 