# Firebase Setup Guide

This guide will help you set up Firebase for your PDF upload React application.

## Prerequisites

- A Google account
- Node.js and npm installed
- Firebase CLI (optional, for advanced features)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "pdf-upload-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Firebase Services

### Enable Firestore Database
1. In your Firebase project console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (you can secure it later)
4. Select a location for your database
5. Click "Done"

### Enable Storage
1. Go to "Storage" in the Firebase console
2. Click "Get started"
3. Choose "Start in test mode" for development
4. Select a location for your storage
5. Click "Done"

## Step 3: Get Your Firebase Configuration

1. In the Firebase console, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "pdf-upload-web")
6. Copy the configuration object

## Step 4: Update Firebase Configuration

### Option 1: Using Environment Variables (Recommended)

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` and replace with your actual values:
   ```
   # Firebase Configuration (Optional - only if using Firebase)
   REACT_APP_FIREBASE_API_KEY=your-actual-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   
   # Webhook Configuration (REQUIRED for webhook uploads)
   REACT_APP_WEBHOOK_URL=https://hook.us2.make.com/your-webhook-url
   REACT_APP_WEBHOOK_API_KEY=your-webhook-api-key
   REACT_APP_WEBHOOK_TIMEOUT=30000
   REACT_APP_WEBHOOK_MAX_RETRIES=3
   ```

### Option 2: Direct Configuration

1. Open `src/config/firebase.config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
export const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## Step 5: Set Up Security Rules (Optional but Recommended)

### Firestore Security Rules
1. Go to Firestore Database → Rules
2. Update the rules to allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /uploads/{document} {
      allow read, write: if true; // For development only
    }
  }
}
```

### Storage Security Rules
1. Go to Storage → Rules
2. Update the rules to allow file uploads:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read, write: if true; // For development only
    }
  }
}
```

**Note:** These rules allow public access. For production, implement proper authentication and authorization.

## Step 6: Test Your Setup

1. Start your React application: `npm start`
2. Switch to "Firebase Upload" mode using the toggle
3. Try uploading PDF files
4. Check the Firebase console to see if files are uploaded to Storage and metadata is stored in Firestore

## Step 7: Production Considerations

### Security Rules for Production
Replace the test mode rules with proper security rules:

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /uploads/{document} {
      allow read, write: if request.auth != null;
    }
  }
}

// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Environment Variables
The application is already configured to use environment variables. The configuration file `src/config/firebase.config.js` automatically reads from environment variables when available.

If you're using the `.env` file approach, no additional code changes are needed - the configuration will automatically pick up the environment variables.

### Customizing Configuration

#### Firebase Configuration (`src/config/firebase.config.js`):
```javascript
// Storage Configuration
export const storageConfig = {
  uploadFolder: 'uploads',           // Change upload folder
  maxFileSize: 10 * 1024 * 1024,    // Change max file size
  allowedTypes: ['application/pdf'], // Change allowed file types
  namingStrategy: 'timestamp'        // Change file naming
};

// Firestore Configuration
export const firestoreConfig = {
  uploadsCollection: 'uploads',      // Change collection name
  maxUploads: 50,                    // Change max uploads to fetch
  orderBy: 'createdAt',              // Change sort field
  orderDirection: 'desc'             // Change sort direction
};

// App Configuration
export const appConfig = {
  name: 'PDF Upload React',          // Change app name
  version: '1.0.0',                  // Change app version
  debug: process.env.NODE_ENV === 'development',
  defaultUploadMode: 'webhook'       // Change default upload mode
};
```

#### Webhook Configuration (`src/config/webhook.config.js`):
```javascript
export const webhookConfig = {
  defaultUrl: process.env.REACT_APP_WEBHOOK_URL,        // Must be set in .env
  defaultApiKey: process.env.REACT_APP_WEBHOOK_API_KEY, // Must be set in .env
  timeout: parseInt(process.env.REACT_APP_WEBHOOK_TIMEOUT) || 30000,
  maxRetries: parseInt(process.env.REACT_APP_WEBHOOK_MAX_RETRIES) || 3,
  headers: {
    'Content-Type': 'multipart/form-data',
    'x-make-apikey': process.env.REACT_APP_WEBHOOK_API_KEY
  }
};
```

## Troubleshooting

### Common Issues

1. **"Firebase App named '[DEFAULT]' already exists"**
   - This usually happens when the app is initialized multiple times
   - Make sure you're only calling `initializeApp()` once

2. **"Permission denied" errors**
   - Check your Firestore and Storage security rules
   - Make sure you're in test mode or have proper authentication

3. **Files not uploading**
   - Check the browser console for errors
   - Verify your Firebase configuration is correct
   - Ensure Storage is enabled in your Firebase project

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase JavaScript SDK Reference](https://firebase.google.com/docs/reference/js)
- [Firebase Community](https://firebase.google.com/community)

## Features Added

With Firebase integration, your app now supports:

- ✅ File upload to Firebase Storage
- ✅ Metadata storage in Firestore
- ✅ File download links
- ✅ Upload history
- ✅ File deletion
- ✅ Progress tracking
- ✅ Error handling
- ✅ Responsive design

The app maintains the original webhook functionality while adding powerful Firebase capabilities! 