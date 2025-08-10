# 🚀 PDF Upload React Application - Chat Template

## 📋 Project Overview

I'm working on a **PDF Upload React Application** with the following architecture:

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

## 🔧 Key Services

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

## 📁 Important Files

```
pdf-upload-react/upload-documents-hr/
├── manuals/                    # 📚 All documentation
│   ├── README.md              # Overview of all manuals
│   ├── PROJECT_OVERVIEW.md    # Complete project documentation
│   ├── CHAT_TEMPLATE.md       # This template
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

## 🚀 Deployment Commands

### Frontend (Netlify)
```bash
# Automatic deployment on git push to main branch
git add .
git commit -m "Your commit message"
git push origin main
```

### Backend (Google Cloud Run)
```bash
# Using deployment script
./deploy.sh backend
# OR manually
gcloud builds submit --tag gcr.io/famous-store-468216-p6/pdfupload-server
gcloud run deploy pdfupload-server --image gcr.io/famous-store-468216-p6/pdfupload-server --platform managed --region me-west1 --allow-unauthenticated
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

## 🔍 Current Status

### ✅ Implemented Features
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

## 📞 Support Information

- **Repository**: https://github.com/cpaie/upload-documents-hr
- **Frontend**: https://coruscating-puppy-056d4c.netlify.app
- **Backend**: https://pdfupload-server-181115428363.me-west1.run.app
- **Supabase**: https://jupbjbcskoetisooirza.supabase.co

## 📚 Documentation Location

All documentation is organized in the `manuals/` directory:
- **Complete Documentation**: `manuals/PROJECT_OVERVIEW.md`
- **Quick Start Guide**: `manuals/QUICK_START.md`
- **Manuals Overview**: `manuals/README.md`

---

**Please help me with any updates, fixes, or new features for this application. Remember to wait for my approval before deploying any changes!**
