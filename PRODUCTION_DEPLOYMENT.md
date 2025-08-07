# Production Deployment Guide

## Overview
This guide explains how to deploy the PDF Upload application to production with proper environment detection.

## Environment Detection

The application automatically detects whether it's running in development or production based on:

1. **NODE_ENV**: Set to `production` in production
2. **Hostname**: Automatically detects localhost vs production domain
3. **Environment Variables**: Uses `REACT_APP_API_BASE_URL` for production API endpoints

## Configuration Files

### 1. Environment Variables
- **Development**: `.env` (already configured)
- **Production**: `.env.production` (create from `env.production.example`)

### 2. Key Production Variables
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://your-api-domain.com
REACT_APP_FRONTEND_URL=https://your-frontend-domain.com

# Google Cloud Storage
REACT_APP_GCS_PROJECT_ID=your-gcs-project-id
REACT_APP_GCS_BUCKET_NAME=your-gcs-bucket-name
REACT_APP_GCS_SERVICE_ACCOUNT_KEY_FILE=./gcs-service-account-key.json

# Webhook
REACT_APP_WEBHOOK_URL=your-webhook-url
REACT_APP_WEBHOOK_API_KEY=your-webhook-api-key
```

## Deployment Steps

### 1. Frontend (React App)
```bash
# Build for production
npm run build:prod

# Or manually set NODE_ENV
NODE_ENV=production npm run build
```

### 2. Backend (Node.js Server)
```bash
# Start server in production mode
npm run server:prod

# Or manually set NODE_ENV
NODE_ENV=production node server-gcs.js
```

## Environment Detection Logs

The application will log environment detection information:

### Frontend Logs
```
[API Config] Environment Detection:
[API Config] NODE_ENV: production
[API Config] Is Production: true
[API Config] REACT_APP_API_BASE_URL: https://your-api-domain.com

[PDFUploadForm] Environment Detection:
[PDFUploadForm] Is Production: true
[PDFUploadForm] API Base URL: https://your-api-domain.com
```

### Backend Logs
```
[SERVER] Environment Detection:
[SERVER] NODE_ENV: production
[SERVER] Is Production: true
[SERVER] Port: 3001

🚀 Google Cloud Storage server running on port 3001
🌍 Environment: PRODUCTION
📁 Health check: https://your-api-domain.com/api/health
📤 Upload endpoint: https://your-api-domain.com/api/gcs/upload
🔗 Generate signed URLs: https://your-api-domain.com/api/gcs/signed-urls
```

## CORS Configuration

The backend automatically configures CORS for production:

- **Development**: Allows `localhost:3000` and `127.0.0.1:3000`
- **Production**: Allows URLs from `FRONTEND_URL` and `REACT_APP_FRONTEND_URL` environment variables

## Firebase Deployment

### 1. Build the Application
```bash
npm run build:prod
```

### 2. Deploy to Firebase Hosting
```bash
firebase deploy --only hosting
```

### 3. Deploy Backend to Firebase Functions (Optional)
```bash
firebase deploy --only functions
```

## Verification

After deployment, verify that:

1. **Environment Detection**: Check browser console for production logs
2. **API Endpoints**: Verify they point to production URLs
3. **CORS**: Ensure frontend can communicate with backend
4. **File Uploads**: Test file upload functionality
5. **Signed URLs**: Verify Signed URLs are generated correctly
6. **Webhook**: Test Make.com integration

## Troubleshooting

### Common Issues

1. **Wrong API URLs**: Check `REACT_APP_API_BASE_URL` is set correctly
2. **CORS Errors**: Verify `FRONTEND_URL` is set in backend environment
3. **Environment Not Detected**: Ensure `NODE_ENV=production` is set
4. **Missing Environment Variables**: Check all required variables are set

### Debug Commands

```bash
# Check environment variables
echo $NODE_ENV
echo $REACT_APP_API_BASE_URL

# Test API endpoints
curl https://your-api-domain.com/api/health

# Check server logs
npm run server:prod
```

## Security Notes

1. **Environment Variables**: Never commit `.env.production` to version control
2. **Service Account Key**: Keep GCS service account key secure
3. **CORS**: Only allow necessary origins
4. **HTTPS**: Always use HTTPS in production
5. **API Keys**: Rotate API keys regularly
