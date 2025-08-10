# Terminal-Based Deployment Guide

## Overview
This guide provides step-by-step terminal commands to deploy the PDF Upload React application to production using various platforms and methods.

## Prerequisites

### 1. Install Required Tools
```bash
# Node.js and npm (already installed)
node --version
npm --version

# Git (for version control)
git --version

# Platform-specific CLI tools (install as needed)
npm install -g netlify-cli
npm install -g gcloud
npm install -g docker
```

### 2. Environment Setup
```bash
# Navigate to project directory
cd pdf-upload-react

# Install dependencies
npm install

# Create production environment file
cp env.production.example .env.production
```

## Deployment Options

### Option 1: Frontend - Netlify Deployment

#### 1.1 Build and Deploy Frontend
```bash
# Build the application
npm run build:prod

# Deploy to Netlify (interactive)
netlify deploy

# Or deploy to production directly
netlify deploy --prod --dir=build
```

#### 1.2 Configure Frontend Environment Variables
```bash
# Set environment variables in Netlify
netlify env:set REACT_APP_API_BASE_URL "https://your-backend-service-url.run.app"
netlify env:set REACT_APP_WEBHOOK_URL "https://hook.eu1.make.com/your-webhook-id"
netlify env:set REACT_APP_WEBHOOK_API_KEY "your-webhook-api-key"
netlify env:set REACT_APP_GCS_PROJECT_ID "your-gcs-project-id"
netlify env:set REACT_APP_GCS_BUCKET_NAME "your-gcs-bucket-name"
```

#### 1.3 Continuous Deployment
```bash
# Connect to Git repository
netlify sites:create --name "your-app-name"

# Set up automatic deployments
netlify deploy --prod --dir=build
```

### Option 2: Backend - Google Cloud Run Deployment

#### 2.1 Prerequisites
```bash
# Install Google Cloud CLI
# Download from: https://cloud.google.com/sdk/docs/install

# Login to Google Cloud
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID
```

#### 2.2 Build and Deploy Backend
```bash
# Build Docker image for backend
docker build -t gcr.io/YOUR_PROJECT_ID/pdf-upload-backend .

# Tag for Google Container Registry
docker tag pdf-upload-backend gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest

# Deploy to Cloud Run
gcloud run deploy pdf-upload-backend \
  --image gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1 \
  --max-instances 10
```

#### 2.3 Configure Backend Environment Variables
```bash
# Set environment variables in Cloud Run
gcloud run services update pdf-upload-backend \
  --region us-central1 \
  --set-env-vars NODE_ENV=production,GCS_PROJECT_ID=your-gcs-project-id,GCS_BUCKET_NAME=your-gcs-bucket-name
```

#### 2.4 Set up Custom Domain (Optional)
```bash
# Map custom domain for backend
gcloud run domain-mappings create \
  --service pdf-upload-backend \
  --domain api.your-domain.com \
  --region us-central1
```

### Option 3: Full Stack Deployment (Frontend + Backend)

#### 3.1 Deploy Backend First
```bash
# Follow Option 2 steps to deploy backend
# Get the backend URL from Cloud Run deployment
```

#### 3.2 Update Frontend Configuration
```bash
# Update frontend environment with backend URL
netlify env:set REACT_APP_API_BASE_URL "https://your-backend-service-url.run.app"
```

#### 3.3 Deploy Frontend
```bash
# Build and deploy frontend
npm run build:prod
netlify deploy --prod --dir=build
```

### Option 4: Docker Deployment (Local/Alternative)

#### 4.1 Build Docker Image
```bash
# Build the Docker image
docker build -t pdf-upload-app .

# Run locally to test
docker run -p 8080:8080 pdf-upload-app
```

#### 4.2 Deploy to Cloud Platforms

**Google Cloud Run (Recommended):**
```bash
# Tag image for Google Container Registry
docker tag pdf-upload-app gcr.io/YOUR_PROJECT_ID/pdf-upload-app

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/pdf-upload-app

# Deploy to Cloud Run
gcloud run deploy pdf-upload-app \
  --image gcr.io/YOUR_PROJECT_ID/pdf-upload-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --cpu 1
```

**Alternative Cloud Platforms:**
```bash
# AWS ECS
aws ecr create-repository --repository-name pdf-upload-app
docker tag pdf-upload-app:latest YOUR_ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/pdf-upload-app:latest
aws ecr get-login-password --region REGION | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com
docker push YOUR_ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/pdf-upload-app:latest

# Azure Container Instances
az acr build --registry YOUR_REGISTRY_NAME --image pdf-upload-app .
az container create --resource-group YOUR_RESOURCE_GROUP --name pdf-upload-app --image YOUR_REGISTRY_NAME.azurecr.io/pdf-upload-app:latest --dns-name-label pdf-upload-app --ports 8080
```

### Option 5: Traditional Server Deployment

#### 5.1 VPS/Cloud Server Setup
```bash
# SSH into your server
ssh user@your-server.com

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/your-username/pdf-upload-react.git
cd pdf-upload-react

# Install dependencies
npm install

# Set environment variables
cp env.production.example .env.production
nano .env.production  # Edit with your values

# Build the application
npm run build:prod

# Install PM2 for process management
npm install -g pm2

# Start the application
pm2 start server-gcs.js --name "pdf-upload-app"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 5.2 Nginx Configuration
```bash
# Install Nginx
sudo apt-get install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/pdf-upload-app

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/pdf-upload-react/build;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/pdf-upload-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 6: Heroku Deployment

#### 6.1 Deploy to Heroku
```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set REACT_APP_API_BASE_URL=https://your-app-name.herokuapp.com
heroku config:set REACT_APP_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-id
heroku config:set REACT_APP_WEBHOOK_API_KEY=your-webhook-api-key

# Deploy
git push heroku main

# Open the app
heroku open
```

### Option 7: Azure App Service

#### 7.1 Deploy to Azure
```bash
# Login to Azure
az login

# Create resource group
az group create --name pdf-upload-rg --location eastus

# Create App Service plan
az appservice plan create --name pdf-upload-plan --resource-group pdf-upload-rg --sku B1

# Create web app
az webapp create --name your-app-name --resource-group pdf-upload-rg --plan pdf-upload-plan --runtime "NODE|20-lts"

# Configure environment variables
az webapp config appsettings set --name your-app-name --resource-group pdf-upload-rg --settings NODE_ENV=production REACT_APP_API_BASE_URL=https://your-app-name.azurewebsites.net

# Deploy
az webapp up --name your-app-name --resource-group pdf-upload-rg
```

## Environment Configuration

### 1. Create Production Environment File
```bash
# Copy example file
cp env.production.example .env.production

# Edit with your values
nano .env.production
```

### 2. Required Environment Variables
```bash
# API Configuration
REACT_APP_API_BASE_URL=https://your-api-domain.com
REACT_APP_FRONTEND_URL=https://your-frontend-domain.com

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Webhook Configuration
REACT_APP_WEBHOOK_URL=https://hook.eu1.make.com/your-webhook-id
REACT_APP_WEBHOOK_API_KEY=your-webhook-api-key

# Google Cloud Storage (if using)
REACT_APP_GCS_PROJECT_ID=your-gcs-project-id
REACT_APP_GCS_BUCKET_NAME=your-gcs-bucket-name
```

## Build Commands

### 1. Development Build
```bash
npm run build
```

### 2. Production Build
```bash
npm run build:prod
```

### 3. Custom Build with Environment
```bash
NODE_ENV=production npm run build
```

## Testing Deployment

### 1. Local Testing
```bash
# Test production build locally
npm run build:prod
npx serve -s build -l 3000

# Test backend server
npm run server:prod
```

### 2. Health Checks
```bash
# Test API endpoints
curl https://your-api-domain.com/api/health

# Test webhook
curl -X POST https://your-api-domain.com/api/webhook/test
```

### 3. File Upload Testing
```bash
# Test file upload endpoint
curl -X POST -F "file=@test.pdf" https://your-api-domain.com/api/upload
```

## Monitoring and Maintenance

### 1. View Logs
```bash
# Netlify
netlify logs

# Vercel
vercel logs

# Firebase
firebase hosting:channel:list

# Heroku
heroku logs --tail

# PM2
pm2 logs pdf-upload-app
```

### 2. Update Application
```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build for production
npm run build:prod

# Deploy (platform-specific)
netlify deploy --prod --dir=build
# or
vercel --prod
# or
firebase deploy --only hosting
```

### 3. Rollback Deployment
```bash
# Netlify
netlify rollback

# Vercel
vercel rollback

# Firebase
firebase hosting:revert
```

## Security Checklist

### 1. Environment Variables
- [ ] All secrets are in environment variables
- [ ] No hardcoded API keys
- [ ] Production values are different from development

### 2. HTTPS
- [ ] All endpoints use HTTPS
- [ ] SSL certificates are valid
- [ ] HSTS headers are configured

### 3. CORS
- [ ] CORS is properly configured
- [ ] Only necessary origins are allowed
- [ ] Credentials are handled securely

### 4. File Upload Security
- [ ] File type validation
- [ ] File size limits
- [ ] Malware scanning (if applicable)

## Troubleshooting

### Common Issues and Solutions

#### 1. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build:prod
```

#### 2. Environment Variable Issues
```bash
# Check environment variables
echo $NODE_ENV
echo $REACT_APP_API_BASE_URL

# Verify in platform dashboard
netlify env:list
vercel env ls
```

#### 3. CORS Errors
```bash
# Check CORS configuration
curl -H "Origin: https://your-frontend.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://your-api.com/api/upload
```

#### 4. File Upload Issues
```bash
# Test file upload with curl
curl -X POST \
  -F "file=@test.pdf" \
  -F "metadata={\"name\":\"test.pdf\"}" \
  https://your-api.com/api/upload
```

## Performance Optimization

### 1. Build Optimization
```bash
# Analyze bundle size
npm run build:prod
npx webpack-bundle-analyzer build/static/js/*.js
```

### 2. Image Optimization
```bash
# Optimize images
npm install -g imagemin-cli
imagemin public/* --out-dir=build
```

### 3. Caching
```bash
# Set cache headers in nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Backup and Recovery

### 1. Database Backup
```bash
# Backup environment variables
cp .env.production .env.production.backup

# Backup build files
cp -r build build.backup
```

### 2. Configuration Backup
```bash
# Export platform configurations
netlify sites:list > netlify-sites.txt
vercel ls > vercel-projects.txt
```

This comprehensive guide covers all major deployment scenarios using terminal commands. Choose the option that best fits your infrastructure and requirements.
