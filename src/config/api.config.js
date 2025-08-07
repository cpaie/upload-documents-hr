// API Configuration for Development and Production
// This file manages API endpoints for different environments

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Base API URLs
const API_CONFIG = {
  // Development - local server
  development: {
    baseUrl: 'http://localhost:3001',
    oneDrive: {
      token: 'http://localhost:3001/api/onedrive/token',
      upload: 'http://localhost:3001/api/onedrive/upload',
      createFolder: 'http://localhost:3001/api/onedrive/folder'
    },
    googleCloudStorage: {
      upload: 'http://localhost:3001/api/gcs/upload',
      fileInfo: 'http://localhost:3001/api/gcs/file-info',
      listFiles: 'http://localhost:3001/api/gcs/files',
      delete: 'http://localhost:3001/api/gcs/delete',
      signedUrls: 'http://localhost:3001/api/gcs/signed-urls'
    },
    webhook: {
      upload: 'http://localhost:3001/api/webhook/upload'
    }
  },
  
  // Production - deployed server
  production: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://your-api-domain.com',
    oneDrive: {
      token: `${process.env.REACT_APP_API_BASE_URL || 'https://your-api-domain.com'}/api/onedrive/token`,
      upload: `${process.env.REACT_APP_API_BASE_URL || 'https://your-api-domain.com'}/api/onedrive/upload`,
      createFolder: `${process.env.REACT_APP_API_BASE_URL || 'https://your-api-domain.com'}/api/onedrive/folder`
    },
    googleCloudStorage: {
      upload: `${process.env.REACT_APP_API_BASE_URL || 'https://your-api-domain.com'}/api/gcs/upload`,
      fileInfo: `${process.env.REACT_APP_API_BASE_URL || 'https://your-api-domain.com'}/api/gcs/file-info`,
      listFiles: `${process.env.REACT_APP_API_BASE_URL || 'https://your-api-domain.com'}/api/gcs/files`,
      delete: `${process.env.REACT_APP_API_BASE_URL || 'https://your-api-domain.com'}/api/gcs/delete`,
      signedUrls: `${process.env.REACT_APP_API_BASE_URL || 'https://your-api-domain.com'}/api/gcs/signed-urls`
    },
    webhook: {
      upload: `${process.env.REACT_APP_API_BASE_URL || 'https://your-api-domain.com'}/api/webhook/upload`
    }
  }
};

// Get current environment config
const getCurrentConfig = () => {
  return isProduction ? API_CONFIG.production : API_CONFIG.development;
};

// API Service Configuration
export const apiConfig = {
  // Current environment
  environment: isProduction ? 'production' : 'development',
  
  // Base URL for current environment
  baseUrl: getCurrentConfig().baseUrl,
  
  // OneDrive endpoints
  oneDrive: getCurrentConfig().oneDrive,
  
  // Google Cloud Storage endpoints
  googleCloudStorage: getCurrentConfig().googleCloudStorage,
  
  // Webhook endpoints
  webhook: getCurrentConfig().webhook,
  
  // Request timeout (5 minutes for large files)
  timeout: 300000,
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoffMultiplier: 2
  },
  
  // Headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Helper function to get full URL
export const getApiUrl = (endpoint) => {
  const config = getCurrentConfig();
  return `${config.baseUrl}${endpoint}`;
};

// Helper function to check if server is available
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${apiConfig.baseUrl}/health`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.error('[API] Server health check failed:', error);
    return false;
  }
};

// Helper function to get environment info
export const getEnvironmentInfo = () => {
  return {
    environment: apiConfig.environment,
    baseUrl: apiConfig.baseUrl,
    isDevelopment,
    isProduction,
    nodeEnv: process.env.NODE_ENV
  };
};

export default apiConfig; 