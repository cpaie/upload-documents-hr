// Example Server API for Documents
// This is an example of how to implement the backend API endpoints
// You can use this as a reference for your actual backend implementation

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for demo purposes
// In production, use a proper database
const documentsDatabase = new Map();

// Initialize with some sample data
documentsDatabase.set('session-123', [
  {
    id: 'doc-session-123-001',
    name: 'ID Document',
    type: 'id',
    status: 'processed',
    uploadedAt: new Date().toISOString(),
    fileSize: '2.5 MB',
    downloadUrl: '/api/documents/download/doc-session-123-001',
    sessionId: 'session-123',
    description: 'Identity document uploaded for verification',
    filePath: './uploads/id-document.pdf'
  },
  {
    id: 'doc-session-123-002',
    name: 'Certificate Document',
    type: 'certificate',
    status: 'processed',
    uploadedAt: new Date().toISOString(),
    fileSize: '1.8 MB',
    downloadUrl: '/api/documents/download/doc-session-123-002',
    sessionId: 'session-123',
    description: 'Certificate document for validation',
    filePath: './uploads/certificate-document.pdf'
  }
]);

// API Routes

/**
 * GET /api/documents/:sessionId
 * Fetch all documents for a specific session ID
 */
app.get('/api/documents/:sessionId', async (req, res) => {
  console.log('[API] Fetching documents for SessionId:', req.params.sessionId);
  
  try {
    const sessionId = req.params.sessionId;
    const documents = documentsDatabase.get(sessionId) || [];
    
    console.log('[API] Found documents:', documents.length);
    
    res.json({
      success: true,
      sessionId: sessionId,
      documents: documents,
      count: documents.length
    });
  } catch (error) {
    console.error('[API] Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      message: error.message
    });
  }
});

/**
 * GET /api/documents/details/:documentId
 * Fetch detailed information about a specific document
 */
app.get('/api/documents/details/:documentId', async (req, res) => {
  console.log('[API] Fetching document details for ID:', req.params.documentId);
  
  try {
    const documentId = req.params.documentId;
    
    // Search for the document in all sessions
    let foundDocument = null;
    for (const [sessionId, documents] of documentsDatabase.entries()) {
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        foundDocument = document;
        break;
      }
    }
    
    if (!foundDocument) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    console.log('[API] Document details found:', foundDocument);
    
    res.json({
      success: true,
      document: foundDocument
    });
  } catch (error) {
    console.error('[API] Error fetching document details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document details',
      message: error.message
    });
  }
});

/**
 * GET /api/documents/download/:documentId
 * Download a specific document file
 */
app.get('/api/documents/download/:documentId', async (req, res) => {
  console.log('[API] Downloading document with ID:', req.params.documentId);
  
  try {
    const documentId = req.params.documentId;
    
    // Search for the document in all sessions
    let foundDocument = null;
    for (const [sessionId, documents] of documentsDatabase.entries()) {
      const document = documents.find(doc => doc.id === documentId);
      if (document) {
        foundDocument = document;
        break;
      }
    }
    
    if (!foundDocument) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Check if file exists
    try {
      await fs.access(foundDocument.filePath);
    } catch (error) {
      console.error('[API] File not found:', foundDocument.filePath);
      return res.status(404).json({
        success: false,
        error: 'Document file not found'
      });
    }
    
    console.log('[API] Sending document file:', foundDocument.filePath);
    
    // Send the file
    res.download(foundDocument.filePath, foundDocument.name);
  } catch (error) {
    console.error('[API] Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download document',
      message: error.message
    });
  }
});

/**
 * POST /api/documents/upload
 * Upload new documents (this would be called by your Make.com webhook)
 */
app.post('/api/documents/upload', async (req, res) => {
  console.log('[API] Document upload request received');
  
  try {
    // This endpoint would handle the webhook from Make.com
    // and store the documents in your database
    
    const { sessionId, documents } = req.body;
    
    if (!sessionId || !documents) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId and documents'
      });
    }
    
    console.log('[API] Storing documents for SessionId:', sessionId);
    console.log('[API] Documents to store:', documents);
    
    // Store documents in database
    documentsDatabase.set(sessionId, documents);
    
    res.json({
      success: true,
      message: 'Documents stored successfully',
      sessionId: sessionId,
      documentCount: documents.length
    });
  } catch (error) {
    console.error('[API] Error storing documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store documents',
      message: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Documents API is running',
    timestamp: new Date().toISOString(),
    sessions: Array.from(documentsDatabase.keys())
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('[API] Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`[API] Documents API server running on port ${PORT}`);
  console.log(`[API] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[API] Sample documents: http://localhost:${PORT}/api/documents/session-123`);
});

module.exports = app; 