// Google Drive Direct Service - No Backend Required
import { GOOGLE_DRIVE_CONFIG } from '../config/environment.js';

class GoogleDriveDirectService {
  constructor() {
    this.accessToken = null;
    this.userEmail = null;
    this.googleDriveApiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    console.log('[GoogleDriveDirectService] Initialized with config:', GOOGLE_DRIVE_CONFIG);
  }

  // Get access token from Supabase user session
  async getAccessToken(user) {
    console.log('[GoogleDriveDirect] Getting access token from Supabase user session...');
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the access token from Supabase session
    const session = user.session || user;
    if (!session?.access_token) {
      throw new Error('No access token found in user session');
    }

    this.accessToken = session.access_token;
    this.userEmail = user.email || user.user_metadata?.email;
    
    console.log('[GoogleDriveDirect] Access token obtained from Supabase session');
    return this.accessToken;
  }

  // Upload file directly to Google Drive using Google Drive API
  async uploadFile(file, userEmail, folderPath = '') {
    console.log('[GoogleDriveDirect] Starting direct file upload to Google Drive');
    console.log('[GoogleDriveDirect] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userEmail: userEmail,
      folderPath: folderPath
    });

    try {
      // Create file metadata
      const fileMetadata = {
        name: file.name,
        parents: folderPath ? [folderPath] : []
      };

      // Create multipart request
      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const multipartRequestBody = 
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(fileMetadata) +
        delimiter +
        'Content-Type: ' + file.type + '\r\n\r\n' +
        await this.fileToBase64(file) +
        close_delim;

      // Upload to Google Drive API directly
      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&key=${this.googleDriveApiKey}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
            'Content-Length': multipartRequestBody.length
          },
          body: multipartRequestBody
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`File upload failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('[GoogleDriveDirect] File uploaded successfully:', {
        fileId: result.id,
        fileName: result.name,
        webUrl: `https://drive.google.com/file/d/${result.id}/view`,
        downloadUrl: `https://drive.google.com/uc?id=${result.id}&export=download`
      });

      return {
        fileId: result.id,
        fileName: result.name,
        webUrl: `https://drive.google.com/file/d/${result.id}/view`,
        downloadUrl: `https://drive.google.com/uc?id=${result.id}&export=download`,
        size: result.size,
        lastModified: result.modifiedTime
      };
    } catch (error) {
      console.error('[GoogleDriveDirect] File upload failed:', error);
      throw error;
    }
  }

  // Convert file to base64 for multipart upload
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  // Upload multiple files directly
  async uploadMultipleFiles(files, userEmail, folderPath = '') {
    console.log('[GoogleDriveDirect] Starting multiple file upload to Google Drive');
    console.log('[GoogleDriveDirect] Files to upload:', files.length);

    const uploadResults = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        console.log(`[GoogleDriveDirect] Uploading file ${i + 1}/${files.length}: ${files[i].file.name}`);
        const result = await this.uploadFile(files[i].file, userEmail, folderPath);
        uploadResults.push({
          ...result,
          originalIndex: i,
          role: files[i].role,
          type: files[i].type
        });
        console.log(`[GoogleDriveDirect] File ${i + 1} uploaded successfully`);
      } catch (error) {
        console.error(`[GoogleDriveDirect] Failed to upload file ${i + 1}:`, error);
        errors.push({
          index: i,
          fileName: files[i].file.name,
          error: error.message
        });
      }
    }

    console.log('[GoogleDriveDirect] Multiple file upload completed:', {
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

  // Create folder directly in Google Drive
  async createFolder(folderName, userEmail, parentFolderPath = '') {
    console.log('[GoogleDriveDirect] Creating folder:', folderName);
    
    try {
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderPath ? [parentFolderPath] : []
      };

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?key=${this.googleDriveApiKey}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(folderMetadata)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Folder creation failed: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('[GoogleDriveDirect] Folder created successfully:', result.name);
      
      return result;
    } catch (error) {
      console.error('[GoogleDriveDirect] Folder creation failed:', error);
      throw error;
    }
  }

  // Get file information directly from Google Drive
  async getFileInfo(fileId, userEmail) {
    console.log('[GoogleDriveDirect] Getting file info for:', fileId);
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?key=${this.googleDriveApiKey}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get file info: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('[GoogleDriveDirect] File info retrieved successfully');
      
      return result;
    } catch (error) {
      console.error('[GoogleDriveDirect] Failed to get file info:', error);
      throw error;
    }
  }
}

export default new GoogleDriveDirectService();
