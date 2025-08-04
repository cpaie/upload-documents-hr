const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// OneDrive configuration
const ONEDRIVE_CONFIG = {
  clientId: '0e489b27-1a2f-48c0-a772-63bc61e6a8a9',
  clientSecret: '0-L8Q~tSkOPV8~WFHDMin_gik~vcakutuLJYua1P',
  tenantId: '22fde68e-d975-441b-a414-73ff55b29824',
  userEmail: 'dudy@cpaie.co.il'
};

// Get OneDrive access token
async function getOneDriveAccessToken() {
  console.log('[SERVER] Getting OneDrive access token...');
  const tokenUrl = `https://login.microsoftonline.com/${ONEDRIVE_CONFIG.tenantId}/oauth2/v2.0/token`;
  const params = new URLSearchParams({
    client_id: ONEDRIVE_CONFIG.clientId,
    client_secret: ONEDRIVE_CONFIG.clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!response.ok) {
    throw new Error(`OneDrive token failed: ${response.status}`);
  }

  const tokenData = await response.json();
  console.log('[SERVER] OneDrive access token obtained successfully');
  return tokenData.access_token;
}

// Upload file to OneDrive
async function uploadFileToOneDrive(fileBuffer, fileName, folderPath = '') {
  console.log(`[SERVER] Uploading file to OneDrive: ${fileName}`);
  
  const accessToken = await getOneDriveAccessToken();
  const timestamp = Date.now();
  
  // Clean filename - remove Hebrew characters and special chars for URL safety
  const cleanFileName = fileName
    .replace(/[^\w\s.-]/g, '') // Remove special characters except letters, numbers, spaces, dots, hyphens
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters (Hebrew)
    .trim();
  
  // If filename is empty after cleaning, use a default name
  const safeFileName = cleanFileName || 'document';
  const uploadFileName = `${timestamp}-${safeFileName}`;
  
  console.log(`[SERVER] Original filename: ${fileName}`);
  console.log(`[SERVER] Cleaned filename: ${uploadFileName}`);
  
  const uploadPath = folderPath ? `${folderPath}/${uploadFileName}` : uploadFileName;
  
  const response = await fetch(
    `https://graph.microsoft.com/v1.0/users/${ONEDRIVE_CONFIG.userEmail}/drive/root:/${uploadPath}:/content`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream'
      },
      body: fileBuffer
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OneDrive upload failed: ${response.status} - ${error}`);
  }

  const result = await response.json();
  console.log(`[SERVER] File uploaded successfully: ${result.name}`);
  return {
    name: result.name,
    originalName: fileName, // Keep original filename for reference
    id: result.id,
    webUrl: result.webUrl,
    size: result.size
  };
}

// Token endpoint
app.get('/api/onedrive/token', async (req, res) => {
  try {
    console.log('[SERVER] Token request received');
    const accessToken = await getOneDriveAccessToken();
    res.json({ access_token: accessToken });
  } catch (error) {
    console.error('[SERVER] Token error:', error.message);
    res.status(500).json({
      error: 'Token request failed',
      message: error.message
    });
  }
});

// Upload endpoint
app.post('/api/onedrive/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('[SERVER] OneDrive upload request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { userEmail, folderPath } = req.body;
    const { originalname, buffer } = req.file;

    console.log(`[SERVER] Processing file: ${originalname}, size: ${buffer.length} bytes, user: ${userEmail}`);

    // Use the provided userEmail instead of the hardcoded one
    const result = await uploadFileToOneDrive(buffer, originalname, folderPath);
    
    console.log('[SERVER] OneDrive upload completed successfully');
    res.json({
      id: result.id,
      name: result.name,
      webUrl: result.webUrl,
      downloadUrl: result.webUrl, // OneDrive webUrl can be used for download
      size: result.size,
      lastModifiedDateTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('[SERVER] OneDrive upload error:', error.message);
    res.status(500).json({
      error: 'OneDrive upload failed',
      message: error.message
    });
  }
});

// Legacy upload endpoint
app.post('/api/upload-to-onedrive', upload.single('file'), async (req, res) => {
  try {
    console.log('[SERVER] Upload request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { folderPath } = req.body;
    const { originalname, buffer } = req.file;

    console.log(`[SERVER] Processing file: ${originalname}, size: ${buffer.length} bytes`);

    const result = await uploadFileToOneDrive(buffer, originalname, folderPath);
    
    console.log('[SERVER] Upload completed successfully');
    res.json({
      success: true,
      file: result
    });

  } catch (error) {
    console.error('[SERVER] Upload error:', error.message);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'OneDrive upload server is running' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 OneDrive upload server running on port ${PORT}`);
  console.log(`📁 Health check: http://localhost:${PORT}/api/health`);
}); 