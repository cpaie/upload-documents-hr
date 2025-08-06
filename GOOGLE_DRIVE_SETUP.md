# Google Drive Setup Guide

This guide will help you set up Google Drive integration for the PDF upload application.

## Prerequisites

1. A Google Cloud Platform account
2. A Google Workspace account (for better integration) or regular Gmail account
3. Node.js and npm installed

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and press "Enable"

## Step 2: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in the required information
   - Add scopes: `https://www.googleapis.com/auth/drive.file`
4. Create OAuth 2.0 Client ID:
   - Application type: "Web application"
   - Name: "PDF Upload App"
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
5. Note down the Client ID and Client Secret

## Step 3: Create API Key

1. In the same Credentials page, click "Create Credentials" > "API Key"
2. Restrict the API key to Google Drive API only
3. Note down the API Key

## Step 4: Create Service Account (Optional but Recommended)

For server-side operations, create a service account:

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Fill in the details and create
4. Add the "Google Drive API" role
5. Create and download the JSON key file
6. Save it as `service-account-key.json` in your project root

## Step 5: Configure Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Update the `.env` file with your Google credentials:
   ```env
   # Google Drive API Configuration
   REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
   REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
   REACT_APP_GOOGLE_API_KEY=your-google-api-key
   REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

   # Google Service Account (if using service account)
   GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json
   ```

## Step 6: Configure Supabase for Google OAuth

1. Go to your Supabase project dashboard
2. Navigate to "Authentication" > "Providers"
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Client ID: Your Google OAuth Client ID
   - Client Secret: Your Google OAuth Client Secret
5. Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

## Step 7: Install Dependencies

```bash
npm install
```

## Step 8: Start the Application

```bash
# Start the development server
npm run dev
```

## Troubleshooting

### Common Issues

1. **"Google Drive API not enabled"**
   - Make sure you've enabled the Google Drive API in your Google Cloud Console

2. **"Invalid redirect URI"**
   - Check that your redirect URI matches exactly in both Google Cloud Console and Supabase

3. **"Service account key not found"**
   - Ensure the service account key file is in the project root
   - Check the file path in your `.env` file

4. **"Authentication failed"**
   - Verify your OAuth credentials are correct
   - Check that the Google provider is enabled in Supabase

### Security Best Practices

1. **Never commit credentials to version control**
   - Keep your `.env` file in `.gitignore`
   - Use environment variables in production

2. **Restrict API access**
   - Limit API key usage to specific APIs
   - Use service accounts for server-side operations

3. **Regular credential rotation**
   - Periodically rotate your API keys and secrets

## Production Deployment

For production deployment:

1. Update redirect URIs to your production domain
2. Use environment variables for all credentials
3. Set up proper CORS configuration
4. Use HTTPS for all communications
5. Consider using Google Cloud Functions for server-side operations

## File Structure

The application will create the following folder structure in Google Drive:

```
PDF-Uploads/
├── YYYY-MM-DD/
│   └── session-{timestamp}/
│       ├── main-id/
│       ├── additional-ids/
│       └── certificate/
```

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Google Drive API is enabled
4. Check Supabase authentication configuration

For additional help, refer to:
- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Supabase Authentication Documentation](https://supabase.com/docs/guides/auth)
