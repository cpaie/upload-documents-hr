# Google Drive Upload Modes Guide

This guide explains the two different modes available for uploading files to Google Drive in this application.

## Overview

The application supports two different approaches for Google Drive integration:

1. **Backend Proxy Mode** (Default) - Uses a Node.js server as a proxy
2. **Direct Frontend Mode** - Uploads directly from the browser without a backend

## Mode 1: Backend Proxy (Default)

### How it Works
- Frontend sends files to local Node.js server (`server.js`)
- Server uses Google Service Account to upload files to Google Drive
- Server acts as a secure proxy between frontend and Google Drive API

### Advantages
- ✅ **Better Security**: API keys and secrets stay on the server
- ✅ **Large File Support**: Can handle files up to 10MB+ efficiently
- ✅ **Service Account**: No need for user OAuth tokens
- ✅ **Reliable**: Server-side processing is more stable
- ✅ **Rate Limiting**: Better control over API usage

### Disadvantages
- ❌ **Requires Backend**: Need to run `node server.js`
- ❌ **More Complex**: Additional server setup required
- ❌ **Local Development**: Server must run on same machine

### Setup
1. Set `REACT_APP_USE_DIRECT_UPLOAD=false` in your `.env` file
2. Create a Google Service Account and download the key file
3. Set `GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json`
4. Start the backend server: `node server.js`
5. Start the React app: `npm start`

### Configuration
```env
REACT_APP_USE_DIRECT_UPLOAD=false
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json
```

## Mode 2: Direct Frontend Upload

### How it Works
- Frontend gets OAuth token from Supabase (Google login)
- Frontend uploads files directly to Google Drive API
- No backend server required

### Advantages
- ✅ **No Backend Required**: Simpler deployment
- ✅ **Direct Connection**: Faster uploads (no proxy)
- ✅ **User Permissions**: Uses user's own Google Drive
- ✅ **Easier Setup**: Fewer moving parts

### Disadvantages
- ❌ **Security Concerns**: API keys exposed in frontend code
- ❌ **File Size Limits**: Browser limitations (usually 2-5MB)
- ❌ **OAuth Required**: Users must authenticate with Google
- ❌ **Token Management**: Need to handle OAuth token refresh

### Setup
1. Set `REACT_APP_USE_DIRECT_UPLOAD=true` in your `.env` file
2. Configure Google OAuth in Supabase
3. Set up Google Drive API credentials
4. Start only the React app: `npm start`

### Configuration
```env
REACT_APP_USE_DIRECT_UPLOAD=true
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret
REACT_APP_GOOGLE_API_KEY=your-google-api-key
```

## Choosing the Right Mode

### Use Backend Proxy Mode When:
- You need to handle large files (>5MB)
- Security is a top priority
- You want to avoid exposing API keys
- You're building a production application
- You need reliable, server-side processing

### Use Direct Frontend Mode When:
- You want a simple setup without backend
- You're building a prototype or demo
- File sizes are small (<5MB)
- Users will authenticate with their own Google accounts
- You want faster development iteration

## Switching Between Modes

To switch between modes, simply change the `REACT_APP_USE_DIRECT_UPLOAD` environment variable:

```env
# For backend mode
REACT_APP_USE_DIRECT_UPLOAD=false

# For direct mode
REACT_APP_USE_DIRECT_UPLOAD=true
```

Then restart your application.

## Troubleshooting

### Backend Mode Issues
- **Server not starting**: Check if port 3001 is available
- **Service Account errors**: Verify the key file path and permissions
- **CORS errors**: Ensure the server is running on the correct port

### Direct Mode Issues
- **OAuth errors**: Check Supabase Google OAuth configuration
- **File size errors**: Reduce file size or switch to backend mode
- **API key errors**: Verify Google API credentials are correct

## Security Considerations

### Backend Mode (Recommended for Production)
- API keys are secure on the server
- Service Account provides controlled access
- No sensitive data exposed to frontend

### Direct Mode (Use with Caution)
- API keys are visible in browser
- Users need Google OAuth permissions
- Consider rate limiting and usage quotas

## Performance Comparison

| Aspect | Backend Mode | Direct Mode |
|--------|-------------|-------------|
| File Size Limit | 10MB+ | 2-5MB |
| Upload Speed | Good | Excellent |
| Setup Complexity | Medium | Low |
| Security | High | Medium |
| Reliability | High | Medium |

## Recommendation

For most production applications, we recommend using **Backend Proxy Mode** due to its better security, reliability, and file size support. Use **Direct Frontend Mode** only for simple prototypes or when you specifically need to avoid a backend server.
