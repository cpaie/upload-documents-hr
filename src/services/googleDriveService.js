// Google Drive Service for file uploads using OAuth delegation
import { API_CONFIG } from '../config/environment.js';

class GoogleDriveService {
  constructor() {
    this.userEmail = null;
    console.log('[GoogleDriveService] Initialized with OAuth delegation');
  }

  // Upload file to Google Drive via server (OAuth delegation)
  async uploadFile(file, userEmail, folderPath = '') {
    console.log('[GoogleDrive] Starting file upload to Google Drive via OAuth delegation');
    console.log('[GoogleDrive] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userEmail: userEmail,
      folderPath: folderPath
    });

    try {
            // Get Google access token from localStorage
      const googleUser = JSON.parse(localStorage.getItem('googleOAuthUser') || '{}');
      const accessToken = googleUser.accessToken; // Fixed: use accessToken directly, not identities

      console.log('=== CLIENT TOKEN DEBUG START ===');
      console.log('[GoogleDrive] Checking for Google access token:', {
        hasGoogleUser: !!googleUser,
        hasAccessToken: !!accessToken,
        userEmail: googleUser.email,
        provider: googleUser.provider,
        accessTokenLength: accessToken ? accessToken.length : 0,
        googleUserFull: googleUser
      });
      console.log('=== CLIENT TOKEN DEBUG END ===');

      if (!accessToken) {
        throw new Error('Google access token not found. Please sign in with Google again.');
      }

      // Create FormData for server upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userEmail', userEmail);
      formData.append('folderPath', folderPath || '');
      formData.append('accessToken', accessToken);

      console.log('[GoogleDrive] Sending file to server with OAuth token');
      console.log('[GoogleDrive] FormData being sent:', {
        fileName: file.name,
        userEmail: userEmail,
        folderPath: folderPath || '',
        accessTokenLength: accessToken ? accessToken.length : 0,
        accessTokenPrefix: accessToken ? accessToken.substring(0, 20) + '...' : 'NONE'
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000);
      
      try {
        const response = await fetch(API_CONFIG.endpoints.googleDrive.upload, {
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
        console.log('[GoogleDrive] File uploaded successfully via OAuth delegation:', {
          fileId: result.id,
          fileName: result.name,
          originalName: result.originalName,
          webUrl: result.webViewLink,
          downloadUrl: result.webContentLink
        });

        return {
          fileId: result.id,
          fileName: result.name,
          originalName: result.originalName,
          webUrl: result.webViewLink,
          downloadUrl: result.webContentLink,
          size: result.size,
          lastModified: result.modifiedTime
        };
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('[GoogleDrive] File upload failed via OAuth delegation:', error);
        throw error;
      }
    } catch (error) {
      console.error('[GoogleDrive] File upload failed:', error);
      throw error;
    }
  }

  // Upload multiple files to Google Drive
  async uploadMultipleFiles(files, userEmail, folderPath = '') {
    console.log('[GoogleDrive] Starting multiple file upload to Google Drive via OAuth delegation');
    console.log('[GoogleDrive] Files to upload:', files.length);

    const uploadResults = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        console.log(`[GoogleDrive] Uploading file ${i + 1}/${files.length}: ${files[i].file.name}`);
        const result = await this.uploadFile(files[i].file, userEmail, folderPath);
        uploadResults.push({
          ...result,
          originalIndex: i,
          role: files[i].role,
          type: files[i].type
        });
        console.log(`[GoogleDrive] File ${i + 1} uploaded successfully`);
      } catch (error) {
        console.error(`[GoogleDrive] Failed to upload file ${i + 1}:`, error);
        errors.push({
          index: i,
          fileName: files[i].file.name,
          error: error.message
        });
      }
    }

    console.log('[GoogleDrive] Multiple file upload completed:', {
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

  // Create folder in Google Drive via OAuth delegation
  async createFolder(folderName, userEmail, parentFolderPath = '') {
    console.log('[GoogleDrive] Creating folder via OAuth delegation:', folderName);
    
    try {
            const googleUser = JSON.parse(localStorage.getItem('googleOAuthUser') || '{}');
      const accessToken = googleUser.accessToken; // Fixed: use accessToken directly

      if (!accessToken) {
        throw new Error('Google access token not found. Please sign in with Google again.');
      }

      const response = await fetch(API_CONFIG.endpoints.googleDrive.createFolder, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          folderName,
          userEmail,
          parentFolderId: parentFolderPath,
          accessToken: accessToken
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Folder creation failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('[GoogleDrive] Folder created successfully via OAuth delegation:', result.name);
      
      return result;
    } catch (error) {
      console.error('[GoogleDrive] Folder creation failed:', error);
      throw error;
    }
  }

  // Get file information from Google Drive via OAuth delegation
  async getFileInfo(fileId, userEmail) {
    console.log('[GoogleDrive] Getting file info via OAuth delegation for:', fileId);
    
    try {
            const googleUser = JSON.parse(localStorage.getItem('googleOAuthUser') || '{}');
      const accessToken = googleUser.accessToken; // Fixed: use accessToken directly

      if (!accessToken) {
        throw new Error('Google access token not found. Please sign in with Google again.');
      }

      const url = new URL(`${API_CONFIG.endpoints.googleDrive.fileInfo}/${fileId}`);
      url.searchParams.append('accessToken', accessToken);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get file info: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('[GoogleDrive] File info retrieved successfully via OAuth delegation');
      
      return result;
    } catch (error) {
      console.error('[GoogleDrive] Failed to get file info:', error);
      throw error;
    }
  }

  // List files in Google Drive via OAuth delegation
  async listFiles(folderId = '', pageSize = 10) {
    console.log('[GoogleDrive] Listing files via OAuth delegation');
    
    try {
            const googleUser = JSON.parse(localStorage.getItem('googleOAuthUser') || '{}');
      const accessToken = googleUser.accessToken; // Fixed: use accessToken directly

      if (!accessToken) {
        throw new Error('Google access token not found. Please sign in with Google again.');
      }

      const url = new URL(API_CONFIG.endpoints.googleDrive.listFiles);
      if (folderId) url.searchParams.append('folderId', folderId);
      url.searchParams.append('pageSize', pageSize);
      url.searchParams.append('accessToken', accessToken);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to list files: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('[GoogleDrive] Files listed successfully via OAuth delegation:', result.files.length);
      
      return result;
    } catch (error) {
      console.error('[GoogleDrive] Failed to list files:', error);
      throw error;
    }
  }
}

export default new GoogleDriveService();
