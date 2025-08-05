# Production Setup Guide

## Overview
This guide explains how to deploy the PDF upload application to production, replacing the local development server with a production-ready backend.

## Current Architecture
- **Frontend**: React app (currently trying to connect to localhost:3001)
- **Backend**: Local Express server (localhost:3001) - **NOT suitable for production**
- **Storage**: OneDrive API + Firebase

## Production Options

### Option 1: Deploy Backend Server (Recommended)

#### 1.1 Create Production Server
Create a new file `server.js` in the root directory:

```javascript
// Production Server for OneDrive API and Webhook Handling
const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// OneDrive endpoints
app.get('/api/onedrive/token', async (req, res) => {
  // Implement Azure AD token retrieval
  res.json({ access_token: process.env.ONEDRIVE_ACCESS_TOKEN });
});

app.post('/api/onedrive/upload', upload.single('file'), async (req, res) => {
  // Implement OneDrive file upload
  // Use Microsoft Graph API or OneDrive REST API
});

// Webhook endpoints
app.post('/api/webhook/upload', async (req, res) => {
  // Process webhook data
  res.json({ sessionId: `session-${Date.now()}` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 1.2 Deploy to Cloud Platform

**Heroku:**
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set ONEDRIVE_CLIENT_ID=your_client_id
heroku config:set ONEDRIVE_CLIENT_SECRET=your_client_secret
heroku config:set ONEDRIVE_TENANT_ID=your_tenant_id

# Deploy
git push heroku main
```

**Azure App Service:**
```bash
# Deploy to Azure
az webapp up --name your-app-name --resource-group your-rg --runtime "NODE|18-lts"
```

**AWS Elastic Beanstalk:**
```bash
# Create EB application
eb init your-app-name
eb create production
eb deploy
```

#### 1.3 Update Frontend Configuration
Update `src/config/api.config.js`:

```javascript
const API_CONFIG = {
  production: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://your-deployed-server.com',
    // ... other endpoints
  }
};
```

### Option 2: Serverless Functions

#### 2.1 Azure Functions
Create Azure Functions for each API endpoint:

```javascript
// api/onedrive/token/index.js
module.exports = async function (context, req) {
  // Get OneDrive token
  context.res = {
    body: { access_token: process.env.ONEDRIVE_ACCESS_TOKEN }
  };
};
```

#### 2.2 AWS Lambda
Create Lambda functions with API Gateway:

```javascript
// onedrive-upload.js
exports.handler = async (event) => {
  // Handle OneDrive upload
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  };
};
```

### Option 3: Direct OneDrive Integration (No Backend)

#### 3.1 Update Frontend to Use OneDrive Directly
Modify `oneDriveService.js` to work directly with OneDrive API:

```javascript
// Use MSAL for authentication
import { PublicClientApplication } from '@azure/msal-browser';

class OneDriveService {
  async getAccessToken() {
    // Use MSAL to get token directly
    const msalInstance = new PublicClientApplication(msalConfig);
    const account = msalInstance.getActiveAccount();
    
    if (!account) {
      throw new Error('No active account');
    }
    
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: account
    });
    
    return response.accessToken;
  }
  
  async uploadFile(file, userEmail) {
    const token = await this.getAccessToken();
    
    // Use Microsoft Graph API directly
    const response = await fetch('https://graph.microsoft.com/v1.0/me/drive/root:/' + file.name + ':/content', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': file.type
      },
      body: file
    });
    
    return response.json();
  }
}
```

## Environment Variables

Create `.env.production` file:

```env
# API Configuration
REACT_APP_API_BASE_URL=https://your-production-server.com
REACT_APP_NODE_ENV=production

# OneDrive Configuration
REACT_APP_ONEDRIVE_CLIENT_ID=your_client_id
REACT_APP_ONEDRIVE_TENANT_ID=your_tenant_id
REACT_APP_ONEDRIVE_REDIRECT_URI=https://your-app.com/auth

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com

# Webhook Configuration
REACT_APP_WEBHOOK_URL=https://your-webhook-endpoint.com
REACT_APP_WEBHOOK_API_KEY=your_webhook_api_key
```

## Deployment Steps

### 1. Prepare Backend
```bash
# Create production server
cp server-api-example.js server.js
# Edit server.js with production logic
```

### 2. Deploy Backend
```bash
# Choose your platform and deploy
# Heroku, Azure, AWS, etc.
```

### 3. Update Frontend
```bash
# Update API configuration
# Set environment variables
npm run build
```

### 4. Deploy Frontend
```bash
# Deploy to hosting service
# Netlify, Vercel, Firebase Hosting, etc.
```

## Security Considerations

### 1. Environment Variables
- Never commit secrets to Git
- Use environment variables for all sensitive data
- Rotate keys regularly

### 2. CORS Configuration
```javascript
// In production server
app.use(cors({
  origin: ['https://your-frontend-domain.com'],
  credentials: true
}));
```

### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. File Upload Security
```javascript
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files allowed'));
    }
    cb(null, true);
  }
});
```

## Monitoring and Logging

### 1. Add Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Health Checks
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

## Recommended Production Setup

1. **Backend**: Deploy Express server to Azure App Service or Heroku
2. **Frontend**: Deploy React app to Netlify or Vercel
3. **Database**: Use Azure Cosmos DB or MongoDB Atlas for session storage
4. **File Storage**: Keep OneDrive + Firebase for redundancy
5. **Monitoring**: Use Application Insights or similar service

## Testing Production

1. Test all upload flows
2. Verify OneDrive integration
3. Check webhook functionality
4. Monitor error logs
5. Test with large files
6. Verify CORS configuration

## Troubleshooting

### Common Issues:
1. **CORS errors**: Check origin configuration
2. **File upload failures**: Verify file size limits
3. **Authentication errors**: Check OneDrive credentials
4. **Webhook timeouts**: Increase timeout values

### Debug Commands:
```bash
# Check server health
curl https://your-server.com/health

# Test OneDrive token
curl https://your-server.com/api/onedrive/token

# Monitor logs
heroku logs --tail  # for Heroku
az webapp log tail  # for Azure
``` 