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

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run build:prod` - Builds the app for production with NODE_ENV=production
- `npm run server` - Starts the backend server (Google Cloud Storage)
- `npm run server:prod` - Starts the backend server in production mode
- `npm run dev` - Runs both frontend and backend concurrently
- `npm run eject` - Ejects from Create React App (one-way operation)

## Upload Modes

### 1. Webhook Upload (Original)
Uploads files directly to Make.com webhooks with the original functionality.

**Setup Instructions**:
1. Log in to your Make.com account
2. Create a new scenario with a Webhook trigger
3. Copy the webhook URL
4. Use the webhook URL in the app

### 2. Firebase Upload (New)
Uploads files to Firebase Storage and stores metadata in Firestore.

**Features**:
- ✅ File storage in Firebase Storage
- ✅ Metadata storage in Firestore
- ✅ Download links for uploaded files
- ✅ Upload history with file management
- ✅ File deletion capabilities
- ✅ Real-time progress tracking

**Setup Instructions**:
- See [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed setup guide

### 3. Google Drive Upload (New)
Uploads files to Google Drive and sends metadata to Make.com webhooks.

**Features**:
- ✅ File storage in Google Drive
- ✅ Organized folder structure
- ✅ Google OAuth authentication
- ✅ Service account integration
- ✅ Real-time progress tracking

**Setup Instructions**:
- See [GOOGLE_DRIVE_SETUP.md](GOOGLE_DRIVE_SETUP.md) for detailed setup guide

**Features**:
- ✅ File storage in OneDrive
- ✅ OneDrive file IDs and URLs sent to webhook
- ✅ Session-based folder organization
- ✅ Real-time progress tracking
- ✅ Comprehensive error handling
- ✅ Azure AD authentication

**Setup Instructions**:
- See [AZURE_SETUP.md](AZURE_SETUP.md) for detailed setup guide

## Usage

### Webhook Upload Mode

1. **Switch to Webhook Mode**: Use the toggle in the header

### OneDrive Upload Mode

1. **Enter User Email**: Provide your email address for OneDrive access
2. **Upload Files**: Select or drag and drop PDF files
3. **Fill Form Details**: Enter roles and document types
4. **Submit**: Files are uploaded to OneDrive and metadata sent to webhook

**Process Flow**:
1. Files are uploaded to OneDrive in a session-specific folder
2. OneDrive file IDs, URLs, and metadata are collected
3. Metadata is sent to Make.com webhook (no base64 file data)
4. Webhook receives structured data with OneDrive references

**Webhook Data Structure**:
```json
{
  "documents": [
    {
      "itemId": 0,
      "filename": "document.pdf",
      "fileType": "application/pdf",
      "docType": "mainId",
      "role": "מנהל",
      "oneDriveFileId": "file-id-123",
      "oneDriveWebUrl": "https://onedrive.live.com/...",
      "oneDriveDownloadUrl": "https://graph.microsoft.com/...",
      "fileSize": 123456,
      "lastModified": "2025-01-01T12:00:00Z"
    }
  ],
  "documentType": "incorporation",
  "timestamp": "2025-01-01T12:00:00Z",
  "totalFiles": "3",
  "oneDriveSessionFolder": "upload-session-1234567890",
  "userEmail": "user@example.com"
}
```
2. **Enter Webhook URL**: Paste your Make.com webhook URL
3. **Enter API Key**: Add your webhook API key
4. **Select Files**: Click or drag and drop PDF files
5. **Upload**: Click "Upload Documents" to send to webhook

### Firebase Upload Mode

1. **Switch to Firebase Mode**: Use the toggle in the header
2. **Select Files**: Click or drag and drop PDF files
3. **Upload**: Click "Upload to Firebase" to store files
4. **View History**: See all uploaded files with download/delete options

### File Requirements

- **Format**: PDF files only
- **Size**: Maximum 10MB per file
- **Quantity**: Exactly 2 files required

## Firebase Features

### File Management
- **Upload**: Files are stored in Firebase Storage with unique timestamps
- **Download**: Direct download links for all uploaded files
- **Delete**: Remove files from both Storage and Firestore
- **History**: View all uploads with metadata

### Data Storage
- **Firebase Storage**: Actual PDF files
- **Firestore**: File metadata (name, size, URL, timestamp)
- **Real-time**: Automatic updates when files are added/removed

## React Features Used

- **React Hooks**: useState, useRef, useEffect for state management
- **Functional Components**: Modern React patterns
- **Event Handling**: Form submission and file handling
- **Conditional Rendering**: Dynamic UI based on state
- **CSS Modules**: Scoped styling for components
- **Firebase SDK**: Storage and Firestore integration

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## Customization

### Styling

Modify the CSS files to customize:
- `src/index.css` - Global styles
- `src/App.css` - App component styles
- `src/components/PDFUploadForm.css` - Upload form styles

### Functionality

Edit the React components to customize:
- `src/components/PDFUploadForm.js` - Webhook upload logic
- `src/components/FirebaseUploadForm.js` - Firebase upload logic
- `src/services/firebaseService.js` - Firebase service functions
- `src/App.js` - App structure and layout

## Development

### Local Development

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure Firebase (optional) - see FIREBASE_SETUP.md
4. Start development server with `npm start`
5. Open browser to `http://localhost:3000`

### Testing

- Test both upload modes
- Test with various PDF file sizes
- Test drag and drop functionality
- Test mobile responsiveness
- Test error scenarios
- Test Firebase features (if configured)

### Building for Production

```bash
# Standard production build
npm run build

# Production build with NODE_ENV=production
npm run build:prod

# Custom environment build
NODE_ENV=production npm run build
>>>>>>> 125ea1c (Add deployment scripts and update documentation for Google Cloud Run + Netlify architecture)
```

## 📁 Project Structure

<<<<<<< HEAD
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
=======
### Quick Deployment

For quick deployment using terminal commands, see [TERMINAL_DEPLOYMENT.md](TERMINAL_DEPLOYMENT.md) for comprehensive instructions.

**Using the Deployment Script (Recommended):**

**Linux/Mac:**
```bash
# Make script executable
chmod +x deploy.sh

# Deploy to different platforms
./deploy.sh netlify    # Deploy frontend to Netlify
./deploy.sh backend    # Deploy backend to Google Cloud Run
./deploy.sh fullstack  # Deploy both frontend and backend
./deploy.sh docker     # Build and run Docker container locally
./deploy.sh test       # Test production build locally
./deploy.sh help       # Show all options
```

**Windows:**
```cmd
# Deploy to different platforms
deploy.bat netlify     # Deploy frontend to Netlify
deploy.bat backend     # Deploy backend to Google Cloud Run
deploy.bat fullstack   # Deploy both frontend and backend
deploy.bat docker      # Build and run Docker container locally
deploy.bat test        # Test production build locally
deploy.bat help        # Show all options
```

**Manual Deployment Commands:**
```bash
# Frontend (Netlify)
npm run build:prod
netlify deploy --prod --dir=build

# Backend (Google Cloud Run)
docker build -t gcr.io/YOUR_PROJECT_ID/pdf-upload-backend .
docker push gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest
gcloud run deploy pdf-upload-backend --image gcr.io/YOUR_PROJECT_ID/pdf-upload-backend:latest --platform managed --region us-central1 --allow-unauthenticated
```

## Troubleshooting
>>>>>>> 125ea1c (Add deployment scripts and update documentation for Google Cloud Run + Netlify architecture)

## 🔐 Key Services

- **Supabase**: User authentication and database
- **Google Cloud Storage**: File storage with Workload Identity
- **Make.com**: Webhook processing
- **Netlify**: Frontend hosting
- **Google Cloud Run**: Backend hosting

## 📞 Support

<<<<<<< HEAD
- **Repository**: https://github.com/cpaie/upload-documents-hr
- **Frontend**: https://coruscating-puppy-056d4c.netlify.app
- **Backend**: https://pdfupload-server-181115428363.me-west1.run.app
- **Supabase**: https://jupbjbcskoetisooirza.supabase.co
=======
Open browser developer tools (F12) to see:
- Console logs for debugging
- Network requests and responses
- React component state
- Firebase SDK logs

## Security Considerations

- **File Validation**: Client-side validation prevents invalid uploads
- **Size Limits**: Prevents large file uploads
- **HTTPS**: Use HTTPS in production for secure file transfer
- **Webhook Security**: Secure your Make.com webhook URL
- **Firebase Security**: Configure proper security rules for production

## Dependencies

- **React**: 18.2.0 - UI library
- **React DOM**: 18.2.0 - DOM rendering
- **React Scripts**: 5.0.1 - Build tools
- **Firebase**: Latest - Firebase SDK for Storage and Firestore
- **Font Awesome**: 6.0.0 - Icons
- **Inter Font**: Google Fonts - Typography

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify webhook/Firebase configuration
4. Test with different files
5. Check [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for Firebase-specific issues
6. See [TERMINAL_DEPLOYMENT.md](TERMINAL_DEPLOYMENT.md) for deployment help
7. Check [PRODUCTION_DEPLOYMENT.md](PRODUCTION_DEPLOYMENT.md) for production setup
>>>>>>> 125ea1c (Add deployment scripts and update documentation for Google Cloud Run + Netlify architecture)

---

**For detailed documentation, see the [manuals/](./manuals/) directory**
