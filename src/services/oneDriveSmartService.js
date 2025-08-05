// Smart OneDrive Service - Auto-switch between proxy and direct
import { environment, getCurrentOneDriveConfig, logEnvironmentInfo, getOneDriveService } from '../config/environment.config';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../config/azureAuth';

class OneDriveSmartService {
  constructor() {
    this.accessToken = null;
    this.userEmail = null;
    this.msalInstance = null;
    this.currentMode = null;
    
    // Log environment info on initialization
    logEnvironmentInfo();
  }

  // Initialize MSAL for direct connection
  async initializeMSAL() {
    console.log('[OneDrive Smart] Initializing MSAL for direct connection...');
    
    if (!this.msalInstance) {
      this.msalInstance = new PublicClientApplication(msalConfig);
      await this.msalInstance.initialize();
      console.log('[OneDrive Smart] MSAL initialized successfully');
    }
    
    return this.msalInstance;
  }

  // Get access token - automatically choose method based on environment
  async getAccessToken() {
    const serviceType = await getOneDriveService();
    this.currentMode = serviceType;
    
    console.log(`[OneDrive Smart] Getting access token using ${serviceType} method...`);
    
    if (serviceType === 'proxy') {
      return this.getAccessTokenViaProxy();
    } else {
      return this.getAccessTokenDirect();
    }
  }

  // Get access token via proxy server (local development)
  async getAccessTokenViaProxy() {
    console.log('[OneDrive Smart] Getting access token via proxy server...');
    
    try {
      const config = getCurrentOneDriveConfig();
      const response = await fetch(config.endpoints.token, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token request failed: ${response.status} - ${error}`);
      }

      const tokenData = await response.json();
      console.log('[OneDrive Smart] Access token obtained successfully via proxy');
      
      this.accessToken = tokenData.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('[OneDrive Smart] Failed to get access token via proxy:', error);
      throw error;
    }
  }

  // Get access token directly from Azure AD (production)
  async getAccessTokenDirect() {
    console.log('[OneDrive Smart] Getting access token directly from Azure AD...');
    
    try {
      const msalInstance = await this.initializeMSAL();
      
      // Check if user is already signed in
      const account = msalInstance.getActiveAccount();
      
      if (!account) {
        console.log('[OneDrive Smart] No active account, initiating login...');
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        console.log('[OneDrive Smart] Login successful:', loginResponse.account?.username);
        this.userEmail = loginResponse.account?.username;
        return loginResponse.accessToken;
      }
      
      console.log('[OneDrive Smart] Using existing account:', account.username);
      this.userEmail = account.username;
      
      // Try to get token silently first
      try {
        const silentResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: account
        });
        console.log('[OneDrive Smart] Token acquired silently');
        return silentResponse.accessToken;
      } catch (silentError) {
        console.log('[OneDrive Smart] Silent token acquisition failed, using popup...');
        const popupResponse = await msalInstance.acquireTokenPopup(loginRequest);
        console.log('[OneDrive Smart] Token acquired via popup');
        return popupResponse.accessToken;
      }
    } catch (error) {
      console.error('[OneDrive Smart] Failed to get access token directly:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Upload file - automatically choose method based on environment
  async uploadFile(file, userEmail, folderPath = '') {
    const serviceType = await getOneDriveService();
    this.currentMode = serviceType;
    
    console.log(`[OneDrive Smart] Starting file upload using ${serviceType} method...`);
    console.log('[OneDrive Smart] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userEmail: userEmail,
      folderPath: folderPath
    });

    if (serviceType === 'proxy') {
      return this.uploadFileViaProxy(file, userEmail, folderPath);
    } else {
      return this.uploadFileDirect(file, userEmail, folderPath);
    }
  }

  // Upload file via proxy server (local development)
  async uploadFileViaProxy(file, userEmail, folderPath = '') {
    console.log('[OneDrive Smart] Uploading file via proxy server...');
    
    try {
      const config = getCurrentOneDriveConfig();
      
      // Create FormData for proxy upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userEmail', userEmail);
      formData.append('folderPath', folderPath || '');

      // Upload file via proxy server with extended timeout for large files
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout
      
      try {
        console.log('[OneDrive Smart] Uploading to proxy endpoint:', config.endpoints.upload);
        const response = await fetch(config.endpoints.upload, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`File upload failed: ${response.status} - ${error}`);
        }

        const result = await response.json();
        console.log('[OneDrive Smart] File uploaded successfully via proxy:', {
          fileId: result.id,
          fileName: result.name,
          webUrl: result.webUrl,
          downloadUrl: result.downloadUrl
        });

        return {
          fileId: result.id,
          fileName: result.name,
          webUrl: result.webUrl,
          downloadUrl: result.downloadUrl,
          size: result.size,
          lastModified: result.lastModifiedDateTime
        };
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('[OneDrive Smart] File upload failed via proxy:', error);
        throw error;
      }
    } catch (error) {
      console.error('[OneDrive Smart] File upload failed:', error);
      throw error;
    }
  }

  // Upload file directly to OneDrive (production)
  async uploadFileDirect(file, userEmail, folderPath = '') {
    console.log('[OneDrive Smart] Uploading file directly to OneDrive...');
    
    try {
      const accessToken = await this.getAccessTokenDirect();
      
      // Build the upload URL
      let uploadUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:';
      
      if (folderPath) {
        uploadUrl += `/${folderPath}`;
      }
      
      uploadUrl += `/${encodeURIComponent(file.name)}:/content`;
      
      console.log('[OneDrive Smart] Direct upload URL:', uploadUrl);
      
      // Upload file directly to OneDrive
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': file.type,
          'Content-Length': file.size.toString()
        },
        body: file
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[OneDrive Smart] Direct upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[OneDrive Smart] File uploaded successfully via direct connection:', {
        fileId: result.id,
        fileName: result.name,
        webUrl: result.webUrl,
        downloadUrl: result['@microsoft.graph.downloadUrl']
      });

      return {
        fileId: result.id,
        fileName: result.name,
        webUrl: result.webUrl,
        downloadUrl: result['@microsoft.graph.downloadUrl'],
        size: result.size,
        lastModified: result.lastModifiedDateTime
      };
    } catch (error) {
      console.error('[OneDrive Smart] Direct file upload failed:', error);
      throw error;
    }
  }

  // Upload multiple files - automatically choose method based on environment
  async uploadMultipleFiles(files, userEmail, folderPath = '') {
    const serviceType = await getOneDriveService();
    this.currentMode = serviceType;
    
    console.log(`[OneDrive Smart] Starting multiple file upload using ${serviceType} method...`);
    console.log('[OneDrive Smart] Files to upload:', files.length);

    const uploadResults = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        console.log(`[OneDrive Smart] Uploading file ${i + 1}/${files.length}: ${files[i].file.name}`);
        const result = await this.uploadFile(files[i].file, userEmail, folderPath);
        uploadResults.push({
          ...result,
          originalIndex: i,
          role: files[i].role,
          type: files[i].type
        });
        console.log(`[OneDrive Smart] File ${i + 1} uploaded successfully`);
      } catch (error) {
        console.error(`[OneDrive Smart] Failed to upload file ${i + 1}:`, error);
        errors.push({
          index: i,
          fileName: files[i].file.name,
          error: error.message
        });
      }
    }

    console.log('[OneDrive Smart] Multiple file upload completed:', {
      successful: uploadResults.length,
      failed: errors.length,
      mode: this.currentMode
    });

    return {
      uploadResults,
      errors,
      totalFiles: files.length,
      successfulUploads: uploadResults.length,
      failedUploads: errors.length,
      mode: this.currentMode
    };
  }

  // Get current user info
  async getCurrentUser() {
    if (this.currentMode === 'proxy') {
      // For proxy mode, we don't have user info from MSAL
      return { username: this.userEmail };
    } else {
      // For direct mode, get user info from MSAL
      console.log('[OneDrive Smart] Getting current user info from MSAL...');
      
      try {
        const msalInstance = await this.initializeMSAL();
        const account = msalInstance.getActiveAccount();
        
        if (!account) {
          return null;
        }
        
        return {
          username: account.username,
          name: account.name,
          homeAccountId: account.homeAccountId
        };
      } catch (error) {
        console.error('[OneDrive Smart] Failed to get current user:', error);
        return null;
      }
    }
  }

  // Get current mode info
  getCurrentMode() {
    return this.currentMode;
  }

  // Get environment info
  getEnvironmentInfo() {
    return {
      currentMode: this.currentMode,
      environment: environment,
      config: getCurrentOneDriveConfig()
    };
  }
}

export default new OneDriveSmartService(); 