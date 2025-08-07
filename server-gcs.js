// Google Cloud Storage Server
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Google Cloud Storage
const { Storage } = require('@google-cloud/storage');

const app = express();
const PORT = process.env.PORT || 3001;

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const isProduction = process.env.NODE_ENV === 'production';

console.log('[SERVER] Environment Detection:');
console.log('[SERVER] NODE_ENV:', process.env.NODE_ENV);
console.log('[SERVER] Is Development:', isDevelopment);
console.log('[SERVER] Is Production:', isProduction);
console.log('[SERVER] Port:', PORT);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000', 
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL, // Production frontend URL
  process.env.REACT_APP_FRONTEND_URL // Alternative env var
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('[SERVER] CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Initialize Google Cloud Storage
let storage;
let bucket;

try {
  console.log('[SERVER] Initializing Google Cloud Storage...');
  console.log('[SERVER] DEBUG Environment Variables:');
  console.log('[SERVER] GCS_PROJECT_ID:', process.env.GCS_PROJECT_ID);
  console.log('[SERVER] GCS_BUCKET_NAME:', process.env.GCS_BUCKET_NAME);
  console.log('[SERVER] GCS_SERVICE_ACCOUNT_KEY_FILE:', process.env.GCS_SERVICE_ACCOUNT_KEY_FILE);
  
  // Initialize with service account key file
  const serviceAccountKeyPath = process.env.GCS_SERVICE_ACCOUNT_KEY_FILE || './gcs-service-account-key.json';
  const projectId = process.env.GCS_PROJECT_ID;
  const bucketName = process.env.GCS_BUCKET_NAME;
  
  if (!projectId || !bucketName) {
    throw new Error('Missing required environment variables: GCS_PROJECT_ID and/or GCS_BUCKET_NAME');
  }
  
  storage = new Storage({
    projectId: projectId,
    keyFilename: serviceAccountKeyPath,
  });
  
  bucket = storage.bucket(bucketName);
  
  console.log('[SERVER] ✅ Google Cloud Storage initialized successfully');
  console.log('[SERVER] Project ID:', projectId);
  console.log('[SERVER] Bucket Name:', bucketName);
  
} catch (error) {
  console.error('[SERVER] ❌ Failed to initialize Google Cloud Storage:', error.message);
  console.error('[SERVER] Please check your GCS configuration and service account key file');
}

// Helper function to generate unique filename
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  // Clean the base name to remove problematic characters
  const cleanBaseName = baseName.replace(/[^a-zA-Z0-9\-_]/g, '_');
  return `${timestamp}-${cleanBaseName}${extension}`;
}

// Helper function to generate signed URLs for existing files
async function generateSignedUrls(filePath, expiresInDays = 14) {
  try {
    if (!bucket) {
      throw new Error('Google Cloud Storage not configured');
    }
    
    const file = bucket.file(filePath);
    const [exists] = await file.exists();
    
    if (!exists) {
      throw new Error('File not found');
    }
    
    const expires = Date.now() + (expiresInDays * 24 * 60 * 60 * 1000);
    
    // Generate read URL
    const [readUrl] = await file.getSignedUrl({
      action: 'read',
      expires: expires,
    });
    
    // Generate write URL
    const [writeUrl] = await file.getSignedUrl({
      action: 'write',
      expires: expires,
    });
    
    return {
      readUrl,
      writeUrl,
      expiresAt: new Date(expires).toISOString(),
      validForDays: expiresInDays
    };
    
  } catch (error) {
    console.error('[SERVER] Error generating signed URLs:', error);
    throw error;
  }
}

// Upload file to Google Cloud Storage
async function uploadFileToGCS(fileBuffer, originalFileName, userEmail, folderPath = '') {
  console.log(`[SERVER] Uploading file to GCS: ${originalFileName}`);
  console.log(`[SERVER] File size: ${fileBuffer.length} bytes`);
  console.log(`[SERVER] User: ${userEmail}`);
  console.log(`[SERVER] Folder path: ${folderPath}`);
  
  try {
    // Generate unique filename
    const uniqueFileName = generateUniqueFilename(originalFileName);
    
    // Construct full path with folder structure
    const fullPath = folderPath ? `${folderPath}/${uniqueFileName}` : uniqueFileName;
    
    console.log(`[SERVER] Full file path: ${fullPath}`);
    
    // Create file in bucket
    const file = bucket.file(fullPath);
    
    // Upload file
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          originalName: originalFileName,
          uploadedBy: userEmail,
          uploadedAt: new Date().toISOString()
        }
      }
    });
    
    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('[SERVER] Upload error:', error);
        reject(error);
      });
      
      stream.on('finish', async () => {
        try {
          // Make file publicly readable (optional)
          // await file.makePublic();
          
          // Get signed URL for download with read/write permissions
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days (2 weeks)
          });
          
          // Also generate a signed URL with write permissions for Make.com
          const [writeUrl] = await file.getSignedUrl({
            action: 'write',
            expires: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14 days (2 weeks)
          });
          
          console.log(`[SERVER] ✅ File uploaded successfully: ${fullPath}`);
          
          resolve({
            fileName: uniqueFileName,
            originalName: originalFileName,
            url: url, // Read URL
            writeUrl: writeUrl, // Write URL for Make.com
            bucket: bucket.name,
            size: fileBuffer.length,
            uploadedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error('[SERVER] Error getting signed URL:', error);
          reject(error);
        }
      });
      
      stream.end(fileBuffer);
    });
    
  } catch (error) {
    console.error('[SERVER] GCS upload error:', error);
    throw error;
  }
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Google Cloud Storage Upload Server',
    bucket: bucket ? bucket.name : 'Not configured'
  });
});

// Upload file endpoint
app.post('/api/gcs/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('[SERVER] GCS upload request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    if (!bucket) {
      return res.status(500).json({ error: 'Google Cloud Storage not configured' });
    }
    
    const { userEmail, folderPath } = req.body;
    const { originalname, buffer } = req.file;
    
    console.log(`[SERVER] Processing file: ${originalname}`);
    console.log(`[SERVER] Size: ${buffer.length} bytes`);
    console.log(`[SERVER] User: ${userEmail}`);
    console.log(`[SERVER] Folder: ${folderPath || 'root'}`);
    
    const result = await uploadFileToGCS(buffer, originalname, userEmail, folderPath);
    
    console.log('[SERVER] ✅ Upload completed successfully');
    res.json(result);
    
  } catch (error) {
    console.error('[SERVER] Upload error:', error.message);
    res.status(500).json({
      error: 'File upload failed',
      message: error.message
    });
  }
});

// Get file info endpoint
app.get('/api/gcs/file-info/:fileName', async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ error: 'Google Cloud Storage not configured' });
    }
    
    const fileName = req.params.fileName;
    const file = bucket.file(fileName);
    
    const [exists] = await file.exists();
    
    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const [metadata] = await file.getMetadata();
    
    res.json({
      name: metadata.name,
      size: metadata.size,
      created: metadata.timeCreated,
      updated: metadata.updated,
      contentType: metadata.contentType
    });
    
  } catch (error) {
    console.error('[SERVER] Get file info error:', error.message);
    res.status(500).json({
      error: 'Failed to get file info',
      message: error.message
    });
  }
});

// List files endpoint
app.get('/api/gcs/files', async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ error: 'Google Cloud Storage not configured' });
    }
    
    const { prefix, maxResults = 100 } = req.query;
    
    const options = {
      maxResults: parseInt(maxResults)
    };
    
    if (prefix) {
      options.prefix = prefix;
    }
    
    const [files] = await bucket.getFiles(options);
    
    const fileList = files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      created: file.metadata.timeCreated,
      updated: file.metadata.updated
    }));
    
    res.json({
      files: fileList,
      total: fileList.length
    });
    
  } catch (error) {
    console.error('[SERVER] List files error:', error.message);
    res.status(500).json({
      error: 'Failed to list files',
      message: error.message
    });
  }
});

// Generate signed URLs endpoint
app.post('/api/gcs/signed-urls', async (req, res) => {
  try {
    console.log('[SERVER] Generate signed URLs request received');
    
    if (!bucket) {
      return res.status(500).json({ error: 'Google Cloud Storage not configured' });
    }
    
    const { filePath, expiresInDays = 14 } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    console.log(`[SERVER] Generating signed URLs for: ${filePath}`);
    console.log(`[SERVER] Expires in: ${expiresInDays} days`);
    
    const result = await generateSignedUrls(filePath, expiresInDays);
    
    console.log('[SERVER] ✅ Signed URLs generated successfully');
    res.json(result);
    
  } catch (error) {
    console.error('[SERVER] Generate signed URLs error:', error.message);
    res.status(500).json({
      error: 'Failed to generate signed URLs',
      message: error.message
    });
  }
});

// Delete file endpoint
app.delete('/api/gcs/delete/:fileName', async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ error: 'Google Cloud Storage not configured' });
    }
    
    const fileName = req.params.fileName;
    const file = bucket.file(fileName);
    
    await file.delete();
    
    console.log(`[SERVER] File deleted: ${fileName}`);
    res.json({ message: 'File deleted successfully' });
    
  } catch (error) {
    console.error('[SERVER] Delete file error:', error.message);
    res.status(500).json({
      error: 'Failed to delete file',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  const serverUrl = isProduction ? `https://your-api-domain.com` : `http://localhost:${PORT}`;
  
  console.log(`🚀 Google Cloud Storage server running on port ${PORT}`);
  console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  console.log(`📁 Health check: ${serverUrl}/api/health`);
  console.log(`📤 Upload endpoint: ${serverUrl}/api/gcs/upload`);
  console.log(`🔗 Generate signed URLs: ${serverUrl}/api/gcs/signed-urls`);
  console.log(`📋 List files: ${serverUrl}/api/gcs/files`);
  console.log(`🗑️  Delete file: ${serverUrl}/api/gcs/delete/:fileName`);
  
  if (bucket) {
    console.log(`✅ Connected to bucket: ${bucket.name}`);
  } else {
    console.log(`❌ Google Cloud Storage not configured`);
  }
  
  console.log(`🔒 CORS allowed origins:`, allowedOrigins);
});

module.exports = app;
