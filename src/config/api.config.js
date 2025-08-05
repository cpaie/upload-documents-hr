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