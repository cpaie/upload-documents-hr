const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { google } = require('googleapis');
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

// Google Drive configuration
const GOOGLE_DRIVE_CONFIG = {
  clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
  clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  redirectUri: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback'
};

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_DRIVE_CONFIG.clientId,
  GOOGLE_DRIVE_CONFIG.clientSecret,
  GOOGLE_DRIVE_CONFIG.redirectUri
);

// Initialize Google Drive API
const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Get Google Drive access token using OAuth2
async function getGoogleDriveAccessToken() {
  console.log('[SERVER] Getting Google Drive access token via OAuth2...');
  
  try {
    // For OAuth2 authentication, we need to use the credentials from environment
    // or get them from the frontend
    const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
    
    if (!accessToken) {
      throw new Error('No Google access token available. Please authenticate via OAuth2 first.');
    }
    
    oauth2Client.setCredentials({ access_token: accessToken });
    
    console.log('[SERVER] Google Drive access token obtained successfully via OAuth2');
    return accessToken;
  } catch (error) {
    console.error('[SERVER] Failed to get Google Drive access token:', error);
    throw error;
  }
}

// Upload file to Google Drive using user's OAuth token
async function uploadFileToGoogleDrive(fileBuffer, fileName, userEmail, folderPath = '', userAccessToken = null) {
  console.log(`[SERVER] Uploading file to Google Drive: ${fileName}`);
  console.log(`[SERVER] Using ${userAccessToken ? 'user OAuth token' : 'NO TOKEN - ERROR'}`);
  
  try {
    // Use user's access token - this is required for OAuth delegation
    if (!userAccessToken) {
      throw new Error('User access token is required for Google Drive upload. Please sign in with Google first.');
    }
    
    // Set user's access token to OAuth client
    oauth2Client.setCredentials({ access_token: userAccessToken });
    
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
    
    // Create file metadata
    const fileMetadata = {
      name: uploadFileName,
      parents: folderPath ? [folderPath] : undefined
    };

    // Create media
    const media = {
      mimeType: 'application/pdf',
      body: require('stream').Readable.from(fileBuffer)
    };

    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink,webContentLink,size,modifiedTime'
    });

    console.log(`[SERVER] File uploaded successfully: ${response.data.name}`);
    return {
      name: response.data.name,
      originalName: fileName, // Keep original filename for reference
      id: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink,
      size: response.data.size,
      modifiedTime: response.data.modifiedTime
    };
  } catch (error) {
    console.error('[SERVER] Google Drive upload error:', error);
    throw new Error(`Google Drive upload failed: ${error.message}`);
  }
}

// Create folder in Google Drive using user's OAuth token
async function createFolderInGoogleDrive(folderName, parentFolderId = null, userAccessToken = null) {
  console.log(`[SERVER] Creating folder in Google Drive: ${folderName}`);
  console.log(`[SERVER] Using ${userAccessToken ? 'user OAuth token' : 'NO TOKEN - ERROR'}`);
  
  try {
    // Use user's access token - this is required for OAuth delegation
    if (!userAccessToken) {
      throw new Error('User access token is required for Google Drive folder creation. Please sign in with Google first.');
    }
    
    // Set user's access token to OAuth client
    oauth2Client.setCredentials({ access_token: userAccessToken });
    
    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : undefined
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id,name,webViewLink'
    });

    console.log(`[SERVER] Folder created successfully: ${response.data.name}`);
    return response.data;
  } catch (error) {
    console.error('[SERVER] Google Drive folder creation error:', error);
    throw new Error(`Google Drive folder creation failed: ${error.message}`);
  }
}

// Google OAuth URL endpoint
app.get('/api/auth/google/url', async (req, res) => {
  try {
    console.log('[SERVER] Google OAuth URL request received');
    
    // Generate OAuth2 URL for frontend to redirect to
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      include_granted_scopes: true
    });
    
    console.log('[SERVER] Generated Google OAuth URL');
    res.json({ 
      authUrl: authUrl,
      message: 'Please redirect to this URL to authenticate with Google Drive'
    });
  } catch (error) {
    console.error('[SERVER] Google OAuth URL error:', error.message);
    res.status(500).json({
      error: 'OAuth URL generation failed',
      message: error.message
    });
  }
});

// Google OAuth callback endpoint
app.get('/api/auth/google/callback', async (req, res) => {
  try {
    console.log('[SERVER] Google OAuth callback received');
    
    const { code } = req.query;
    
    if (!code) {
      return res.redirect(`http://localhost:3000?auth_error=${encodeURIComponent('Authorization code not provided')}`);
    }
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('[SERVER] OAuth tokens obtained successfully');
    console.log('[SERVER] Access token available:', !!tokens.access_token);
    
    // Get user info using the access token
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    console.log('[SERVER] User info retrieved:', userInfo.data.email);
    
    // Create user object with tokens included
    const userData = {
      id: userInfo.data.id,
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
      provider: 'google',
      identities: [{
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: 'bearer'
      }]
    };
    
    console.log('[SERVER] Redirecting to frontend with user data');
    
    // Redirect to frontend with user data
    const redirectUrl = `http://localhost:3000?auth_success=true&user=${encodeURIComponent(JSON.stringify(userData))}`;
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('[SERVER] OAuth callback error:', error.message);
    const redirectUrl = `http://localhost:3000?auth_error=${encodeURIComponent(error.message)}`;
    res.redirect(redirectUrl);
  }
});

// Token endpoint - for OAuth2 flow
app.get('/api/googledrive/token', async (req, res) => {
  try {
    console.log('[SERVER] Google Drive token request received');
    
    // Generate OAuth2 URL for frontend to redirect to
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    });
    
    res.json({ 
      authUrl: authUrl,
      message: 'Please redirect to this URL to authenticate with Google Drive'
    });
  } catch (error) {
    console.error('[SERVER] Google Drive token error:', error.message);
    res.status(500).json({
      error: 'Token request failed',
      message: error.message
    });
  }
});

// OAuth2 callback endpoint
app.get('/api/googledrive/callback', async (req, res) => {
  try {
    console.log('[SERVER] Google Drive OAuth2 callback received');
    
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    console.log('[SERVER] OAuth2 tokens obtained successfully');
    
    res.json({
      success: true,
      message: 'Google Drive authentication successful',
      accessToken: tokens.access_token
    });
  } catch (error) {
    console.error('[SERVER] OAuth2 callback error:', error.message);
    res.status(500).json({
      error: 'OAuth2 callback failed',
      message: error.message
    });
  }
});

// Set access token endpoint
app.post('/api/googledrive/set-token', async (req, res) => {
  try {
    console.log('[SERVER] Setting Google Drive access token');
    
    const { accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token not provided' });
    }
    
    oauth2Client.setCredentials({ access_token: accessToken });
    
    console.log('[SERVER] Google Drive access token set successfully');
    res.json({ success: true, message: 'Access token set successfully' });
  } catch (error) {
    console.error('[SERVER] Set token error:', error.message);
    res.status(500).json({
      error: 'Failed to set access token',
      message: error.message
    });
  }
});

// Upload endpoint
app.post('/api/googledrive/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('[SERVER] Google Drive upload request received');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { userEmail, folderPath, accessToken } = req.body;
    const { originalname, buffer } = req.file;

    console.log(`[SERVER] Processing file: ${originalname}, size: ${buffer.length} bytes, user: ${userEmail}`);
    console.log(`[SERVER] === TOKEN DEBUG START ===`);
    console.log(`[SERVER] Access token provided: ${!!accessToken}`);
    console.log(`[SERVER] Access token type: ${typeof accessToken}`);
    console.log(`[SERVER] Access token length: ${accessToken ? accessToken.length : 0}`);
    console.log(`[SERVER] Access token prefix: ${accessToken ? accessToken.substring(0, 20) + '...' : 'NONE'}`);
    console.log(`[SERVER] Request body keys:`, Object.keys(req.body));
    console.log(`[SERVER] Full request body:`, req.body);
    console.log(`[SERVER] === TOKEN DEBUG END ===`);

    const result = await uploadFileToGoogleDrive(buffer, originalname, userEmail, folderPath, accessToken);
    
    console.log('[SERVER] Google Drive upload completed successfully');
    res.json({
      id: result.id,
      name: result.name,
      webViewLink: result.webViewLink,
      webContentLink: result.webContentLink,
      size: result.size,
      modifiedTime: result.modifiedTime
    });

  } catch (error) {
    console.error('[SERVER] Google Drive upload error:', error.message);
    res.status(500).json({
      error: 'Google Drive upload failed',
      message: error.message
    });
  }
});

// Create folder endpoint
app.post('/api/googledrive/create-folder', async (req, res) => {
  try {
    console.log('[SERVER] Google Drive create folder request received');
    
    const { folderName, parentFolderId, accessToken } = req.body;

    if (!folderName) {
      return res.status(400).json({ error: 'Folder name is required' });
    }

    console.log(`[SERVER] Access token provided for folder creation: ${!!accessToken}`);

    const result = await createFolderInGoogleDrive(folderName, parentFolderId, accessToken);
    
    console.log('[SERVER] Google Drive folder creation completed successfully');
    res.json(result);

  } catch (error) {
    console.error('[SERVER] Google Drive folder creation error:', error.message);
    res.status(500).json({
      error: 'Google Drive folder creation failed',
      message: error.message
    });
  }
});

// File info endpoint
app.get('/api/googledrive/file-info/:fileId', async (req, res) => {
  try {
    console.log('[SERVER] Google Drive file info request received');
    
    const { fileId } = req.params;
    const { accessToken } = req.query; // Get access token from query params
    
    // Use user's access token if provided, otherwise fall back to server token
    if (accessToken) {
      oauth2Client.setCredentials({ access_token: accessToken });
    } else {
      await getGoogleDriveAccessToken();
    }

    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id,name,webViewLink,webContentLink,size,modifiedTime'
    });

    console.log('[SERVER] Google Drive file info retrieved successfully');
    res.json(response.data);

  } catch (error) {
    console.error('[SERVER] Google Drive file info error:', error.message);
    res.status(500).json({
      error: 'Failed to get file info',
      message: error.message
    });
  }
});

// List files endpoint
app.get('/api/googledrive/files', async (req, res) => {
  try {
    console.log('[SERVER] Google Drive list files request received');
    
    const { folderId, pageSize = 10, accessToken } = req.query;
    
    // Use user's access token if provided, otherwise fall back to server token
    if (accessToken) {
      oauth2Client.setCredentials({ access_token: accessToken });
    } else {
      await getGoogleDriveAccessToken();
    }

    const listParams = {
      pageSize: parseInt(pageSize),
      fields: 'files(id,name,webViewLink,webContentLink,size,modifiedTime,mimeType)'
    };

    if (folderId) {
      listParams.q = `'${folderId}' in parents`;
    }

    const response = await drive.files.list(listParams);

    console.log('[SERVER] Google Drive files listed successfully:', response.data.files.length);
    res.json({
      files: response.data.files || [],
      total: response.data.files?.length || 0
    });

  } catch (error) {
    console.error('[SERVER] Google Drive list files error:', error.message);
    res.status(500).json({
      error: 'Failed to list files',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Google Drive upload server is running' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Google Drive upload server running on port ${PORT}`);
  console.log(`📁 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 OAuth2 URL: http://localhost:${PORT}/api/googledrive/token`);
}).on('error', (error) => {
  console.error('❌ Server failed to start:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port.`);
  }
  process.exit(1);
}); 