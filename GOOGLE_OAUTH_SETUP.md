# Google OAuth Setup Guide

This guide will help you set up Google OAuth for user authentication in your PDF upload application.

## Prerequisites

1. A Google Cloud Console account
2. Access to create OAuth 2.0 credentials

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API

## Step 2: Create OAuth 2.0 Credentials

1. In the Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Set the following:
   - **Name**: PDF Upload App (or any name you prefer)
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/google/callback` (for development)
     - `https://your-domain.com/auth/google/callback` (for production)

## Step 3: Update Environment Variables

1. Copy your OAuth 2.0 credentials:
   - **Client ID**: Copy from the credentials page
   - **Client Secret**: Copy from the credentials page

2. Update your `.env` file with the real values:

```env
# Google OAuth Configuration (for user authentication)
REACT_APP_GOOGLE_CLIENT_ID=your-actual-google-oauth-client-id-here
REACT_APP_GOOGLE_CLIENT_SECRET=your-actual-google-oauth-client-secret-here
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
```

## Step 4: Test the Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Click "התחבר עם Google" (Sign in with Google)
3. You should be redirected to Google's OAuth consent screen
4. After authentication, you should be redirected back to your app

## Security Notes

- **Never commit your `.env` file** to version control
- **Use different OAuth credentials** for development and production
- **Restrict OAuth scopes** to only what's necessary
- **Monitor OAuth usage** in Google Cloud Console

## Troubleshooting

### "Google OAuth not configured" Error
- Make sure `REACT_APP_GOOGLE_CLIENT_ID` is set in your `.env` file
- Restart the server after updating environment variables

### "Invalid redirect URI" Error
- Check that the redirect URI in Google Cloud Console matches exactly
- Ensure the protocol (http/https) and port number are correct

### "Access blocked" Error
- Verify that your domain is in the authorized origins list
- Check that the OAuth consent screen is properly configured

## Production Deployment

For production deployment:

1. Update the redirect URI to your production domain
2. Add your production domain to authorized origins
3. Update the `.env` file with production credentials
4. Ensure HTTPS is enabled on your production server

## Current Configuration

Your application now uses:
- **Google OAuth** for user authentication (users must sign in with their Google account)
- **Google Service Account** for file uploads (files go to your Google Drive)

This provides a secure authentication system where:
- Only authorized Google users can access the application
- Files are uploaded to your Google Drive account via the Service Account
- User authentication is separate from file upload authentication
