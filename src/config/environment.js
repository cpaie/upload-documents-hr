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
    googleDrive: {
      upload: 'http://localhost:3001/api/googledrive/upload',
      createFolder: 'http://localhost:3001/api/googledrive/create-folder',
      fileInfo: 'http://localhost:3001/api/googledrive/file-info',
      listFiles: 'http://localhost:3001/api/googledrive/files'
    },
    firebase: {
      upload: 'http://localhost:3001/api/firebase/upload',
      createFolder: 'http://localhost:3001/api/firebase/create-folder'
    },
    oneDrive: {
      upload: 'http://localhost:3001/api/onedrive/upload',
      createFolder: 'http://localhost:3001/api/onedrive/create-folder'
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

// Google Drive Configuration - Service Account only
const GOOGLE_DRIVE_CONFIG = {
  serviceAccountKeyFile: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 
                         process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 
                         './service-account-key.json',
  // OAuth credentials are not needed for Service Account
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'service-account',
  clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || 'service-account',
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || 'service-account',
  redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
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
  GOOGLE_DRIVE_CONFIG,
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
  console.log('Google Drive Redirect URI:', GOOGLE_DRIVE_CONFIG.redirectUri);
  console.log('API Base URL:', API_CONFIG.baseUrl);
}
