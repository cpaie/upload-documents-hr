// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// For production, use environment variables instead of hardcoded values

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id"
};

// Firebase Storage Configuration
export const storageConfig = {
  // Default folder for uploads
  uploadFolder: 'uploads',
  // Maximum file size in bytes (10MB)
  maxFileSize: 10 * 1024 * 1024,
  // Allowed file types
  allowedTypes: ['application/pdf'],
  // File naming strategy
  namingStrategy: 'timestamp' // 'timestamp' | 'original' | 'custom'
};

// Firestore Configuration
export const firestoreConfig = {
  // Collection name for uploads
  uploadsCollection: 'uploads',
  // Maximum number of uploads to fetch
  maxUploads: 50,
  // Order uploads by
  orderBy: 'createdAt',
  // Order direction
  orderDirection: 'desc'
};

// App Configuration
export const appConfig = {
  // App name
  name: 'PDF Upload React',
  // App version
  version: '1.0.0',
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  // Default upload mode
  defaultUploadMode: 'webhook' // 'webhook' | 'firebase'
}; 