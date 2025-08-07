// OneDrive Service - Direct Integration (No Proxy Required)
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../config/azureAuth';

class OneDriveDirectService {
  constructor() {
    this.accessToken = null;
    this.userEmail = null;
    this.msalInstance = null;
  }

  // Initialize MSAL
  async initializeMSAL() {
    console.log('[OneDrive Direct] Initializing MSAL...');
    
    if (!this.msalInstance) {
      this.msalInstance = new PublicClientApplication(msalConfig);
      await this.msalInstance.initialize();
      console.log('[OneDrive Direct] MSAL initialized successfully');
    }
    
    return this.msalInstance;
  }

  // Get access token directly from Azure AD
  async getAccessToken() {
    console.log('[OneDrive Direct] Getting access token directly from Azure AD...');
    
    try {
      const msalInstance = await this.initializeMSAL();
      
      // Check if user is already signed in
      const account = msalInstance.getActiveAccount();
      
      if (!account) {
        console.log('[OneDrive Direct] No active account, initiating login...');
        const loginResponse = await msalInstance.loginPopup(loginRequest);
        console.log('[OneDrive Direct] Login successful:', loginResponse.account?.username);
        this.userEmail = loginResponse.account?.username;
        return loginResponse.accessToken;
      }
      
      console.log('[OneDrive Direct] Using existing account:', account.username);
      this.userEmail = account.username;
      
      // Try to get token silently first
      try {
        const silentResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account: account
        });
        console.log('[OneDrive Direct] Token acquired silently');
        return silentResponse.accessToken;
      } catch (silentError) {
        console.log('[OneDrive Direct] Silent token acquisition failed, using popup...');
        const popupResponse = await msalInstance.acquireTokenPopup(loginRequest);
        console.log('[OneDrive Direct] Token acquired via popup');
        return popupResponse.accessToken;
      }
    } catch (error) {
      console.error('[OneDrive Direct] Failed to get access token:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  // Upload file directly to OneDrive
  async uploadFile(file, userEmail, folderPath = '') {
    console.log('[OneDrive Direct] Starting direct file upload to OneDrive');
    console.log('[OneDrive Direct] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userEmail: userEmail,
      folderPath: folderPath
    });

    try {
      const accessToken = await this.getAccessToken();
      
      // Build the upload URL
      let uploadUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:';
      
      if (folderPath) {
        uploadUrl += `/${folderPath}`;
      }
      
      uploadUrl += `/${encodeURIComponent(file.name)}:/content`;
      
      console.log('[OneDrive Direct] Upload URL:', uploadUrl);
      
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
        console.error('[OneDrive Direct] Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[OneDrive Direct] File uploaded successfully:', {
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
      console.error('[OneDrive Direct] File upload failed:', error);
      throw error;
    }
  }

  // Upload multiple files directly to OneDrive
  async uploadMultipleFiles(files, userEmail, folderPath = '') {
    console.log('[OneDrive Direct] Starting multiple file upload to OneDrive');
    console.log('[OneDrive Direct] Files to upload:', files.length);

    const uploadResults = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        console.log(`[OneDrive Direct] Uploading file ${i + 1}/${files.length}: ${files[i].file.name}`);
        const result = await this.uploadFile(files[i].file, userEmail, folderPath);
        uploadResults.push({
          ...result,
          originalIndex: i,
          role: files[i].role,
          type: files[i].type
        });
        console.log(`[OneDrive Direct] File ${i + 1} uploaded successfully`);
      } catch (error) {
        console.error(`[OneDrive Direct] Failed to upload file ${i + 1}:`, error);
        errors.push({
          index: i,
          fileName: files[i].file.name,
          error: error.message
        });
      }
    }

    console.log('[OneDrive Direct] Multiple file upload completed:', {
      successful: uploadResults.length,
      failed: errors.length
    });

    return {
      uploadResults,
      errors,
      totalFiles: files.length,
      successfulUploads: uploadResults.length,
      failedUploads: errors.length
    };
  }

  // Create folder directly in OneDrive
  async createFolder(folderName, userEmail, parentFolderPath = '') {
    console.log('[OneDrive Direct] Creating folder directly in OneDrive:', folderName);
    
    try {
      const accessToken = await this.getAccessToken();
      
      // Build the folder creation URL
      let folderUrl = 'https://graph.microsoft.com/v1.0/me/drive/root:';
      
      if (parentFolderPath) {
        folderUrl += `/${parentFolderPath}`;
      }
      
      folderUrl += `:/children`;
      
      console.log('[OneDrive Direct] Folder creation URL:', folderUrl);
      
      const response = await fetch(folderUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Folder creation failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[OneDrive Direct] Folder created successfully:', result.name);
      
      return result;
    } catch (error) {
      console.error('[OneDrive Direct] Folder creation failed:', error);
      throw error;
    }
  }

  // Get file information directly from OneDrive
  async getFileInfo(fileId, userEmail) {
    console.log('[OneDrive Direct] Getting file info directly from OneDrive:', fileId);
    
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get file info: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('[OneDrive Direct] File info retrieved successfully');
      
      return result;
    } catch (error) {
      console.error('[OneDrive Direct] Failed to get file info:', error);
      throw error;
    }
  }

  // Sign out user
  async signOut() {
    console.log('[OneDrive Direct] Signing out user...');
    
    try {
      const msalInstance = await this.initializeMSAL();
      await msalInstance.logoutPopup();
      this.accessToken = null;
      this.userEmail = null;
      console.log('[OneDrive Direct] User signed out successfully');
    } catch (error) {
      console.error('[OneDrive Direct] Sign out failed:', error);
      throw error;
    }
  }

  // Get current user info
  async getCurrentUser() {
    console.log('[OneDrive Direct] Getting current user info...');
    
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
      console.error('[OneDrive Direct] Failed to get current user:', error);
      return null;
    }
  }
}

export default new OneDriveDirectService(); 