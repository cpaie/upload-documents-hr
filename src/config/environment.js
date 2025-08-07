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
  baseUrl: process.env.REACT_APP_API_BASE_URL,
  endpoints: {
    googleCloudStorage: {
      upload: process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api/gcs/upload` : null,
      fileInfo: process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api/gcs/file-info` : null,
      listFiles: process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api/gcs/files` : null,
      delete: process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api/gcs/delete` : null,
      signedUrls: process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api/gcs/signed-urls` : null
    },
    firebase: {
      upload: process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api/firebase/upload` : null,
      createFolder: process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api/firebase/create-folder` : null
    },
    oneDrive: {
      upload: process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api/onedrive/upload` : null,
      createFolder: process.env.REACT_APP_API_BASE_URL ? `${process.env.REACT_APP_API_BASE_URL}/api/onedrive/create-folder` : null
    }
  }
};

const SUPABASE_CONFIG = {
  url: process.env.REACT_APP_SUPABASE_URL,
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  serviceRoleKey: process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY,
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
  console.log('🔍 Raw Environment Variables:');
  console.log('  REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('  REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.REACT_APP_SUPABASE_ANON_KEY.length + ')' : 'NOT SET');
  console.log('  REACT_APP_GCS_PROJECT_ID:', process.env.REACT_APP_GCS_PROJECT_ID);
  console.log('  REACT_APP_GCS_BUCKET_NAME:', process.env.REACT_APP_GCS_BUCKET_NAME);
  console.log('Supabase Config:', {
    url: SUPABASE_CONFIG.url ? 'SET' : 'NOT SET',
    anonKey: SUPABASE_CONFIG.anonKey ? 'SET' : 'NOT SET'
  });
  console.log('Google Cloud Storage Config:', {
    projectId: GOOGLE_CLOUD_STORAGE_CONFIG.projectId ? 'SET' : 'NOT SET',
    bucketName: GOOGLE_CLOUD_STORAGE_CONFIG.bucketName ? 'SET' : 'NOT SET'
  });
  console.log('API Base URL:', API_CONFIG.baseUrl ? 'SET' : 'NOT SET');
  console.log('Firebase Config:', {
    apiKey: FIREBASE_CONFIG.apiKey ? 'SET' : 'NOT SET',
    projectId: FIREBASE_CONFIG.projectId ? 'SET' : 'NOT SET'
  });
} else {
  console.log('🚀 Production Mode Detected');
  console.log('Environment Info:', ENV_INFO);
  console.log('🔍 Raw Environment Variables:');
  console.log('  REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
  console.log('  REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.REACT_APP_SUPABASE_ANON_KEY.length + ')' : 'NOT SET');
  console.log('  REACT_APP_GCS_PROJECT_ID:', process.env.REACT_APP_GCS_PROJECT_ID);
  console.log('  REACT_APP_GCS_BUCKET_NAME:', process.env.REACT_APP_GCS_BUCKET_NAME);
  console.log('Supabase Config:', {
    url: SUPABASE_CONFIG.url ? 'SET' : 'NOT SET',
    anonKey: SUPABASE_CONFIG.anonKey ? 'SET' : 'NOT SET'
  });
  console.log('API Base URL:', API_CONFIG.baseUrl ? 'SET' : 'NOT SET');
  console.log('Google Cloud Storage Config:', {
    projectId: GOOGLE_CLOUD_STORAGE_CONFIG.projectId ? 'SET' : 'NOT SET',
    bucketName: GOOGLE_CLOUD_STORAGE_CONFIG.bucketName ? 'SET' : 'NOT SET'
  });
}
