# PDF Upload React Application - Project Overview

## 🏗️ Application Architecture

### Frontend (React.js)
- **Location**: `pdf-upload-react/upload-documents-hr/`
- **Framework**: React.js with hooks
- **Hosting**: Netlify (https://coruscating-puppy-056d4c.netlify.app)
- **Branch**: `main`

### Backend (Node.js)
- **Location**: `pdf-upload-react/upload-documents-hr/server-gcs.js`
- **Platform**: Google Cloud Run
- **URL**: https://pdfupload-server-181115428363.me-west1.run.app
- **Authentication**: Workload Identity (no service account key needed)

## 📁 Key Files Structure

```
pdf-upload-react/upload-documents-hr/
├── manuals/                    # 📚 All documentation
│   ├── README.md              # Overview of all manuals
│   ├── PROJECT_OVERVIEW.md    # This file - complete documentation
│   ├── CHAT_TEMPLATE.md       # Template for new chat sessions
│   └── QUICK_START.md         # Quick start guide
├── src/
│   ├── App.js                    # Main app component with auth
│   ├── components/
│   │   ├── MainApp.js           # Main navigation logic
│   │   ├── PDFUploadForm.js     # File upload form
│   │   ├── DocumentsView.js     # View uploaded documents
│   │   ├── SignupPopup.js       # Authentication popup
│   │   └── SubabaseClient.js    # Supabase client setup
│   ├── config/
│   │   └── environment.js       # Environment configuration
│   └── services/
│       └── googleCloudStorageService.js
├── server-gcs.js                # Backend API server
├── Dockerfile                   # Backend containerization
├── netlify.toml                 # Netlify configuration
├── deploy.sh                    # Linux/Mac deployment script
├── deploy.ps1                   # Windows deployment script
├── quick-update.sh              # Quick update script (Linux/Mac)
├── quick-update.ps1             # Quick update script (Windows)
└── README.md                    # Main project README
```

## 🔧 Configuration Files

### Environment Variables (Frontend - Netlify)
```env
REACT_APP_SUPABASE_URL=https://jupbjbcskoetisooirza.supabase.co
REACT_APP_SUPABASE_ANON_KEY=[your-anon-key]
REACT_APP_API_BASE_URL=https://pdfupload-server-181115428363.me-west1.run.app
REACT_APP_GCS_PROJECT_ID=famous-store-468216-p6
REACT_APP_GCS_BUCKET_NAME=pdf-upload-myapp
REACT_APP_WEBHOOK_URL=[your-webhook-url]
REACT_APP_WEBHOOK_API_KEY=[your-webhook-key]
```

### Environment Variables (Backend - Cloud Run)
```env
GCS_PROJECT_ID=famous-store-468216-p6
GCS_BUCKET_NAME=pdf-upload-myapp
WEBHOOK_URL=[your-webhook-url]
WEBHOOK_API_KEY=[your-webhook-key]
FRONTEND_URL=https://coruscating-puppy-056d4c.netlify.app
```

## 🚀 Deployment Commands

### Frontend Deployment (Netlify)
```bash
# Automatic deployment on git push to main branch
git add .
git commit -m "Your commit message"
git push origin main
```

### Backend Deployment (Google Cloud Run)
```bash
# Build and deploy backend
gcloud builds submit --tag gcr.io/famous-store-468216-p6/pdfupload-server
gcloud run deploy pdfupload-server \
  --image gcr.io/famous-store-468216-p6/pdfupload-server \
  --platform managed \
  --region me-west1 \
  --allow-unauthenticated \
  --set-env-vars GCS_PROJECT_ID=famous-store-468216-p6,GCS_BUCKET_NAME=pdf-upload-myapp
```

### Quick Deployment Scripts
```bash
# Linux/Mac
./quick-update.sh both    # Quick deployment
./deploy.sh both         # Full deployment

# Windows (PowerShell)
.\quick-update.ps1 both   # Quick deployment
.\deploy.ps1 both        # Full deployment
```

## 🔐 Authentication & Services

### Supabase
- **URL**: https://jupbjbcskoetisooirza.supabase.co
- **Purpose**: User authentication and database
- **Table**: `HR_cert_id` (with `cert_type` column)

### Google Cloud Storage
- **Project**: famous-store-468216-p6
- **Bucket**: pdf-upload-myapp
- **Authentication**: Workload Identity (Cloud Run)
- **Access**: Signed URLs for Make.com

### Make.com (Webhook)
- **Purpose**: Process uploaded file metadata
- **Payload**: Includes `cert_type` field for Supabase
- **Authentication**: API key

## 📋 Current Features

### ✅ Implemented
- User authentication (Supabase + Google OAuth)
- PDF file upload to Google Cloud Storage
- Organized folder structure (main-id, additional-ids, certificate)
- Webhook integration with Make.com
- Document viewing and management
- SPA routing for Netlify
- ESLint compliance
- Environment variable management
- Automated deployment scripts
- Comprehensive documentation in `manuals/` directory

### 🔄 Recent Updates
- Fixed ESLint warnings for Netlify build
- Added `cert_type` field to webhook payload
- Updated GCS authentication to use Workload Identity
- Removed Firebase dependencies
- Added comprehensive error handling
- Organized all documentation in `manuals/` directory
- Created automated deployment scripts for both platforms

## 🛠️ Development Workflow

### Local Development
```bash
cd pdf-upload-react/upload-documents-hr
npm install
npm start
```

### Testing Configuration
```bash
npm run test:config
```

### Build Testing
```bash
npm run build
```

## 🚨 Important Notes

1. **Environment Variables**: Never commit `.env` files
2. **Service Account**: Backend uses Workload Identity, no key file needed
3. **CORS**: Backend allows Netlify domain
4. **Build Process**: Netlify uses `CI=false` to ignore warnings
5. **Authentication**: Supports multiple providers (Supabase, Google OAuth)
6. **Documentation**: All guides are in `manuals/` directory
7. **Deployment**: Use provided scripts for automated deployment

## 🔍 Troubleshooting

### Common Issues
1. **ESLint Build Failures**: Check for unused variables and useEffect dependencies
2. **CORS Errors**: Verify Netlify URL is in backend CORS list
3. **GCS Access**: Ensure Workload Identity is configured
4. **Webhook Failures**: Check API key and URL configuration

### Debug Commands
```bash
# Check environment variables
npm run test:config

# Check build locally
npm run build

# Check backend logs
gcloud logs read --service=pdfupload-server --limit=50
```

## 📞 Support Information

- **Repository**: https://github.com/cpaie/upload-documents-hr
- **Frontend**: https://coruscating-puppy-056d4c.netlify.app
- **Backend**: https://pdfupload-server-181115428363.me-west1.run.app
- **Supabase**: https://jupbjbcskoetisooirza.supabase.co

## 📚 Documentation Location

All documentation is organized in the `manuals/` directory:
- **Complete Documentation**: `manuals/PROJECT_OVERVIEW.md` (this file)
- **Quick Start Guide**: `manuals/QUICK_START.md`
- **Chat Template**: `manuals/CHAT_TEMPLATE.md`
- **Manuals Overview**: `manuals/README.md`

---

**Last Updated**: December 2024
**Version**: 1.0.0
