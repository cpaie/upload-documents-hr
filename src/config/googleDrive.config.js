// Google Drive Configuration
const googleDriveConfig = {
  // Google Drive API configuration
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  
  // Scopes for Google Drive access
  scopes: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  
  // Default folder structure
  defaultFolder: 'PDF-Uploads',
  
  // Upload settings
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['application/pdf'],
  
  // Authentication settings
  authType: 'oauth2',
  
  // Check if Google Drive is properly configured
  isConfigured() {
    return !!(this.clientId && this.clientSecret && this.apiKey);
  },
  
  // Get configuration status
  getConfigStatus() {
    return {
      clientId: !!this.clientId,
      clientSecret: !!this.clientSecret,
      apiKey: !!this.apiKey,
      isConfigured: this.isConfigured()
    };
  }
};

export default googleDriveConfig;
