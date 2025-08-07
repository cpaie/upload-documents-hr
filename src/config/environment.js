// Environment Configuration
// Automatically detects development vs production environment

const isDevelopment = process.env.NODE_ENV === 'development' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';

const isProduction = !isDevelopment;

// Base URLs
const getBaseUrl = () => {
  if (isDevelopment) {
    return 'http://localhost:3000';
  }
  // In production, use the current domain
  return window.location.origin;
};

// Environment configuration
const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001',
  endpoints: {
    googleCloudStorage: {
      upload: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/gcs/upload`,
      fileInfo: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/gcs/file-info`,
      listFiles: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/gcs/files`,
      delete: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/gcs/delete`,
      signedUrls: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/gcs/signed-urls`
    },
    firebase: {
      upload: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/firebase/upload`,
      createFolder: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/firebase/create-folder`
    },
    oneDrive: {
      upload: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/onedrive/upload`,
      createFolder: `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'}/api/onedrive/create-folder`
    }
  }
};

const SUPABASE_CONFIG = {
  url: process.env.REACT_APP_SUPABASE_URL,
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  redirectUrls: {
    google: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
  }
};

const FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Google Cloud Storage Configuration
const GOOGLE_CLOUD_STORAGE_CONFIG = {
  projectId: process.env.REACT_APP_GCS_PROJECT_ID,
  bucketName: process.env.REACT_APP_GCS_BUCKET_NAME,
  serviceAccountKeyFile: process.env.REACT_APP_GCS_SERVICE_ACCOUNT_KEY_FILE || './gcs-service-account-key.json',
  // Optional: specify folder structure
  uploadFolder: process.env.REACT_APP_GCS_UPLOAD_FOLDER || 'pdf-uploads'
};

const ONEDRIVE_CONFIG = {
  clientId: process.env.REACT_APP_ONEDRIVE_CLIENT_ID,
  clientSecret: process.env.REACT_APP_ONEDRIVE_CLIENT_SECRET,
  redirectUri: process.env.REACT_APP_ONEDRIVE_REDIRECT_URI || 'http://localhost:3000/auth/onedrive/callback'
};

export {
  API_CONFIG,
  SUPABASE_CONFIG,
  FIREBASE_CONFIG,
  GOOGLE_CLOUD_STORAGE_CONFIG,
  ONEDRIVE_CONFIG
};

// Environment Info
export const ENV_INFO = {
  isDevelopment,
  isProduction,
  baseUrl: getBaseUrl(),
  nodeEnv: process.env.NODE_ENV,
  hostname: window.location.hostname,
  port: window.location.port
};

// Debug logging
if (isDevelopment) {
  console.log('🔧 Development Mode Detected');
  console.log('Environment Info:', ENV_INFO);
  console.log('Supabase Redirect URLs:', SUPABASE_CONFIG.redirectUrls);
  console.log('Google Cloud Storage Config:', GOOGLE_CLOUD_STORAGE_CONFIG);
  console.log('API Base URL:', API_CONFIG.baseUrl);
} else {
  console.log('🚀 Production Mode Detected');
  console.log('Environment Info:', ENV_INFO);
  console.log('API Base URL:', API_CONFIG.baseUrl);
  console.log('Google Cloud Storage Config:', GOOGLE_CLOUD_STORAGE_CONFIG);
}
