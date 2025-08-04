# SessionId Integration with Make.com

This document explains how to set up and use the SessionId integration to receive data back from Make.com and display related documents.

## Overview

The application now supports:
1. **Receiving SessionId from Make.com** after document upload
2. **Displaying documents related to a SessionId** on a dedicated page
3. **Downloading documents** from the documents view
4. **Navigation between upload and documents views**

## How It Works

### 1. Document Upload Flow
1. User uploads PDF documents via the upload form
2. Documents are sent to Make.com webhook
3. Make.com processes the documents and returns a `SessionId` in the response
4. The application captures the `SessionId` and automatically navigates to the documents view
5. Documents related to that `SessionId` are displayed

### 2. SessionId Response Format

Make.com should return a response in one of these formats:

```json
{
  "SessionId": "session-123",
  "status": "success",
  "message": "Documents processed successfully"
}
```

OR

```json
{
  "sessionId": "session-123",
  "status": "success",
  "message": "Documents processed successfully"
}
```

OR

```json
{
  "body": {
    "SessionId": "session-123"
  },
  "status": "success"
}
```

The application will automatically detect and extract the SessionId from any of these formats.

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Existing webhook configuration
REACT_APP_WEBHOOK_URL=https://hook.us2.make.com/your-webhook-url
REACT_APP_WEBHOOK_API_KEY=your-webhook-api-key

# New API configuration (optional - for production)
REACT_APP_API_BASE_URL=http://localhost:3001
```

### 2. Backend API Setup

You have two options for the backend:

#### Option A: Use the Example Server (Development)

1. Install dependencies:
```bash
npm install express cors
```

2. Run the example server:
```bash
node server-api-example.js
```

The server will run on `http://localhost:3001` and provide sample data.

#### Option B: Implement Your Own Backend

Create API endpoints that match these patterns:

- `GET /api/documents/:sessionId` - Fetch documents by SessionId
- `GET /api/documents/download/:documentId` - Download a document
- `GET /api/documents/details/:documentId` - Get document details

### 3. Make.com Configuration

Configure your Make.com scenario to:

1. **Receive the uploaded documents**
2. **Process them as needed**
3. **Return a response with SessionId**

Example Make.com response:
```json
{
  "SessionId": "{{generateUUID()}}",
  "status": "success",
  "message": "Documents uploaded and processed successfully",
  "documentCount": 2
}
```

## Usage

### 1. Upload Documents
1. Go to the upload form
2. Select your PDF documents
3. Click "Upload Documents"
4. Wait for the upload to complete

### 2. View Documents
1. After successful upload, you'll see the SessionId displayed
2. Click "View Documents" to see all documents related to that session
3. The documents view shows:
   - Document names and types
   - Upload timestamps
   - File sizes
   - Processing status
   - Download buttons

### 3. Download Documents
1. In the documents view, click "Download" on any document
2. The document will be downloaded to your device

## API Endpoints

### Frontend Service (`documentsService.js`)

The frontend uses these service methods:

```javascript
// Fetch documents by SessionId
const documents = await documentsService.fetchDocumentsBySessionId(sessionId);

// Download a document
const blob = await documentsService.downloadDocument(documentId);

// Get document details
const details = await documentsService.fetchDocumentDetails(documentId);
```

### Backend API Endpoints

#### GET `/api/documents/:sessionId`
Fetch all documents for a session.

**Response:**
```json
{
  "success": true,
  "sessionId": "session-123",
  "documents": [
    {
      "id": "doc-001",
      "name": "ID Document",
      "type": "id",
      "status": "processed",
      "uploadedAt": "2024-01-01T12:00:00.000Z",
      "fileSize": "2.5 MB",
      "downloadUrl": "/api/documents/download/doc-001"
    }
  ],
  "count": 1
}
```

#### GET `/api/documents/download/:documentId`
Download a specific document file.

#### GET `/api/documents/details/:documentId`
Get detailed information about a document.

## Development Features

### Mock Data
In development mode, if the API is not available, the application will:
1. Show mock documents for testing
2. Display sample data with realistic formatting
3. Allow testing of the UI without a backend

### Console Logging
The application includes extensive console logging for debugging:
- Upload progress and status
- SessionId extraction
- API calls and responses
- Navigation between views

## Troubleshooting

### SessionId Not Detected
1. Check that Make.com is returning the SessionId in the expected format
2. Verify the webhook response in the browser console
3. Ensure the SessionId field name matches one of the supported formats

### Documents Not Loading
1. Check the API endpoint is running and accessible
2. Verify the SessionId is being passed correctly
3. Check browser console for API errors
4. In development, mock data should appear if API is unavailable

### Download Issues
1. Verify the document download endpoint is working
2. Check file permissions on the server
3. Ensure the document file exists at the specified path

## File Structure

```
src/
├── components/
│   ├── PDFUploadForm.js          # Modified to handle SessionId
│   ├── DocumentsView.js          # New component for documents display
│   ├── DocumentsView.css         # Styling for documents view
│   └── MainApp.js               # Modified to handle navigation
├── services/
│   └── documentsService.js      # API service for documents
└── config/
    └── webhook.config.js        # Existing webhook configuration

server-api-example.js            # Example backend implementation
```

## Next Steps

1. **Implement your actual backend API** using the example as a reference
2. **Configure Make.com** to return SessionId in the response
3. **Set up proper authentication** for the API endpoints
4. **Add error handling** for production use
5. **Implement document storage** (database, cloud storage, etc.)

## Support

For issues or questions:
1. Check the browser console for detailed logs
2. Verify your Make.com webhook configuration
3. Test the API endpoints independently
4. Review the example server implementation 