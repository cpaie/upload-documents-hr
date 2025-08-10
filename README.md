# 📄 PDF Upload React Application

A comprehensive React application for secure PDF document upload and management with Google Cloud Storage integration.

## 🚀 Live Demo

- **Frontend**: https://coruscating-puppy-056d4c.netlify.app
- **Backend API**: https://pdfupload-server-181115428363.me-west1.run.app

## 📚 Documentation

All documentation has been moved to the `manuals/` directory for better organization:

### 📋 Available Manuals

- **[📖 Complete Documentation](./manuals/PROJECT_OVERVIEW.md)** - Full project overview and technical details
- **[🚀 Quick Start Guide](./manuals/QUICK_START.md)** - Get started quickly with the project
- **[💬 Chat Template](./manuals/CHAT_TEMPLATE.md)** - Template for new chat sessions
- **[📄 Original README](./manuals/README.md)** - Original project documentation

### 🎯 Quick Start

1. **Clone and install:**
   ```bash
   git clone https://github.com/cpaie/upload-documents-hr.git
   cd upload-documents-hr
   npm install
   ```

2. **Set up environment variables:**
   ```env
   REACT_APP_SUPABASE_URL=https://jupbjbcskoetisooirza.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=[your-anon-key]
   REACT_APP_API_BASE_URL=https://pdfupload-server-181115428363.me-west1.run.app
   REACT_APP_GCS_PROJECT_ID=famous-store-468216-p6
   REACT_APP_GCS_BUCKET_NAME=pdf-upload-myapp
   REACT_APP_WEBHOOK_URL=[your-webhook-url]
   REACT_APP_WEBHOOK_API_KEY=[your-webhook-key]
   ```

3. **Start development:**
   ```bash
   npm start
   ```

## 🚀 Deployment Scripts

### Windows (PowerShell):
```powershell
# Quick deployment
.\quick-update.ps1 both

# Full deployment
.\deploy.ps1 both
```

### Linux/Mac:
```bash
# Quick deployment
./quick-update.sh both

# Full deployment
./deploy.sh both
```

## 📁 Project Structure

```
pdf-upload-react/upload-documents-hr/
├── manuals/                    # 📚 All documentation
├── src/                        # React source code
├── server-gcs.js              # Backend API server
├── deploy.sh                  # Linux/Mac deployment script
├── deploy.ps1                 # Windows deployment script
├── quick-update.sh            # Quick update script (Linux/Mac)
├── quick-update.ps1           # Quick update script (Windows)
├── Dockerfile                 # Backend containerization
└── netlify.toml              # Netlify configuration
```

## 🔐 Key Services

- **Supabase**: User authentication and database
- **Google Cloud Storage**: File storage with Workload Identity
- **Make.com**: Webhook processing
- **Netlify**: Frontend hosting
- **Google Cloud Run**: Backend hosting

## 📞 Support

- **Repository**: https://github.com/cpaie/upload-documents-hr
- **Frontend**: https://coruscating-puppy-056d4c.netlify.app
- **Backend**: https://pdfupload-server-181115428363.me-west1.run.app
- **Supabase**: https://jupbjbcskoetisooirza.supabase.co

---

**For detailed documentation, see the [manuals/](./manuals/) directory**
