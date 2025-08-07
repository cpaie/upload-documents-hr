// Google Cloud Storage Service for file uploads
import { API_CONFIG } from '../config/environment.js';

class GoogleCloudStorageService {
  constructor() {
    console.log('[GoogleCloudStorage] Service initialized');
    console.log('[GoogleCloudStorage] Environment check:');
    console.log('[GoogleCloudStorage] NODE_ENV:', process.env.NODE_ENV);
    console.log('[GoogleCloudStorage] Is Production:', process.env.NODE_ENV === 'production');
    console.log('[GoogleCloudStorage] API Config:', API_CONFIG);
    console.log('[GoogleCloudStorage] Upload URL:', API_CONFIG.endpoints.googleCloudStorage.upload);
  }

  // Upload single file to Google Cloud Storage
  async uploadFile(file, userEmail, folderPath = '') {
    console.log('[GoogleCloudStorage] Starting file upload');
    console.log('[GoogleCloudStorage] File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userEmail: userEmail,
      folderPath: folderPath
    });

    try {
      // Create FormData for server upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userEmail', userEmail);
      formData.append('folderPath', folderPath || '');

      console.log('[GoogleCloudStorage] Sending file to server');
      console.log('[GoogleCloudStorage] Upload URL:', API_CONFIG.endpoints.googleCloudStorage.upload);

      // Upload file via server with extended timeout for large files
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes timeout

      try {
        const response = await fetch(API_CONFIG.endpoints.googleCloudStorage.upload, {
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
        console.log('[GoogleCloudStorage] File uploaded successfully:', {
          fileName: result.fileName,
          originalName: result.originalName,
          url: result.url,
          writeUrl: result.writeUrl,
          bucket: result.bucket
        });

        return {
          fileName: result.fileName,
          originalName: result.originalName,
          url: result.url, // Read URL
          writeUrl: result.writeUrl, // Write URL for Make.com
          bucket: result.bucket,
          size: result.size,
          uploadedAt: result.uploadedAt
        };
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('[GoogleCloudStorage] File upload failed:', error);
        throw error;
      }
    } catch (error) {
      console.error('[GoogleCloudStorage] File upload failed:', error);
      throw error;
    }
  }

  // Upload multiple files to Google Cloud Storage
  async uploadMultipleFiles(files, userEmail, folderPath = '') {
    console.log('[GoogleCloudStorage] Starting multiple file upload');
    console.log('[GoogleCloudStorage] Files to upload:', files.length);

    const uploadResults = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      try {
        console.log(`[GoogleCloudStorage] Uploading file ${i + 1}/${files.length}: ${files[i].file.name}`);
        const result = await this.uploadFile(files[i].file, userEmail, folderPath);
        uploadResults.push({
          ...result,
          originalIndex: i,
          role: files[i].role,
          type: files[i].type
        });
        console.log(`[GoogleCloudStorage] File ${i + 1} uploaded successfully`);
      } catch (error) {
        console.error(`[GoogleCloudStorage] Failed to upload file ${i + 1}:`, error);
        errors.push({
          index: i,
          fileName: files[i].file.name,
          error: error.message
        });
      }
    }

    console.log('[GoogleCloudStorage] Multiple file upload completed:', {
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

  // Get file information from Google Cloud Storage
  async getFileInfo(fileName, userEmail) {
    console.log('[GoogleCloudStorage] Getting file info for:', fileName);

    try {
      const url = new URL(`${API_CONFIG.endpoints.googleCloudStorage.fileInfo}/${encodeURIComponent(fileName)}`);

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
      console.log('[GoogleCloudStorage] File info retrieved successfully');

      return result;
    } catch (error) {
      console.error('[GoogleCloudStorage] Failed to get file info:', error);
      throw error;
    }
  }

  // List files in Google Cloud Storage
  async listFiles(prefix = '', maxResults = 100) {
    console.log('[GoogleCloudStorage] Listing files with prefix:', prefix);

    try {
      const url = new URL(API_CONFIG.endpoints.googleCloudStorage.listFiles);
      if (prefix) url.searchParams.append('prefix', prefix);
      url.searchParams.append('maxResults', maxResults);

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
      console.log('[GoogleCloudStorage] Files listed successfully:', result.files.length);

      return result;
    } catch (error) {
      console.error('[GoogleCloudStorage] Failed to list files:', error);
      throw error;
    }
  }

  // Delete file from Google Cloud Storage
  async deleteFile(fileName) {
    console.log('[GoogleCloudStorage] Deleting file:', fileName);

    try {
      const response = await fetch(`${API_CONFIG.endpoints.googleCloudStorage.delete}/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to delete file: ${response.status} - ${error}`);
      }

      const result = await response.json();
      console.log('[GoogleCloudStorage] File deleted successfully');

      return result;
    } catch (error) {
      console.error('[GoogleCloudStorage] Failed to delete file:', error);
      throw error;
    }
  }
}

export default new GoogleCloudStorageService();
