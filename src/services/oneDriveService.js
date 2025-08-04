// OneDrive Service for file uploads
import { msalConfig, loginRequest } from '../config/azureAuth';

class OneDriveService {
  constructor() {
    this.accessToken = null;
    this.userEmail = null;
  }

  // Get access token using proxy server
  async getAccessToken() {
    console.log('[OneDrive] Getting access token via proxy server...');
    
    try {
      const response = await fetch('http://localhost:3001/api/onedrive/token', {
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
      console.log('[OneDrive] Access token obtained successfully via proxy');
      
      this.accessToken = tokenData.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('[OneDrive] Failed to get access token via proxy:', error);
      throw error;
    }
  }

  // Upload file to OneDrive via proxy server
  async uploadFile(file, userEmail, folderPath = '') {
    console.log('[OneDrive] Starting file upload to OneDrive via proxy server');
    console.log('[OneDrive] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userEmail: userEmail,
      folderPath: folderPath
    });

    try {
      // Create FormData for proxy upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userEmail', userEmail);
      formData.append('folderPath', folderPath || '');

      // Upload file via proxy server with extended timeout for large files
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout
      
      try {
        const response = await fetch('http://localhost:3001/api/onedrive/upload', {
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
        console.log('[OneDrive] File uploaded successfully via proxy:', {
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
        console.error('[OneDrive] File upload failed via proxy:', error);
        throw error;
      }
    } catch (error) {
      console.error('[OneDrive] File upload failed:', error);
      throw error;
    }
  }

  // Upload multiple files to OneDrive
  async uploadMultipleFiles(files, userEmail, folderPath = '') {
    console.log('[OneDrive] Starting multiple file upload to OneDrive');
    console.log('[OneDrive] Files to upload:', files.length);

    const uploadResults = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        console.log(`[OneDrive] Uploading file ${i + 1}/${files.length}: ${files[i].file.name}`);
        const result = await this.uploadFile(files[i].file, userEmail, folderPath);
        uploadResults.push({
          ...result,
          originalIndex: i,
          role: files[i].role,
          type: files[i].type
        });
        console.log(`[OneDrive] File ${i + 1} uploaded successfully`);
      } catch (error) {
        console.error(`[OneDrive] Failed to upload file ${i + 1}:`, error);
        errors.push({
          index: i,
          fileName: files[i].file.name,
          error: error.message
        });
      }
    }

    console.log('[OneDrive] Multiple file upload completed:', {
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

  // Create folder in OneDrive
  async createFolder(folderName, userEmail, parentFolderPath = '') {
    console.log('[OneDrive] Creating folder:', folderName);
    
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const folderUrl = `https://graph.microsoft.com/v1.0/users/${userEmail}/drive/root:/${parentFolderPath}/${folderName}:/children`;
      
      const response = await fetch(folderUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: folderName,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Folder creation failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('[OneDrive] Folder created successfully:', result.name);
      
      return result;
    } catch (error) {
      console.error('[OneDrive] Folder creation failed:', error);
      throw error;
    }
  }

  // Get file information from OneDrive
  async getFileInfo(fileId, userEmail) {
    console.log('[OneDrive] Getting file info for:', fileId);
    
    try {
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const response = await fetch(`https://graph.microsoft.com/v1.0/users/${userEmail}/drive/items/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get file info: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('[OneDrive] File info retrieved successfully');
      
      return result;
    } catch (error) {
      console.error('[OneDrive] Failed to get file info:', error);
      throw error;
    }
  }
}

export default new OneDriveService(); 