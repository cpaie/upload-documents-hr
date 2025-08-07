// Firebase Configuration
// Replace these values with your actual Firebase project configuration
// For production, use environment variables instead of hardcoded values

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
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