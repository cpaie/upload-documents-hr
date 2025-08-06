import React, { useState, useRef, useEffect } from 'react';
import { webhookConfig } from '../config/webhook.config';
import googleDriveService from '../services/googleDriveService';
import googleDriveDirectService from '../services/googleDriveDirectService';
import './PDFUploadForm.css';

const PDFUploadForm = ({ onSessionIdReceived, savedFormData, savedUploadedFiles, onFormDataSaved, user }) => {
  const [formData, setFormData] = useState(() => {
    // Initialize with saved data if available, otherwise use defaults
    if (savedFormData) {
      console.log('[PDFUploadForm] Restoring saved form data:', savedFormData);
      return savedFormData;
    }
    return {
      documentType: 'incorporation', // 'incorporation', 'authorization', 'exemption'
      mainIdRole: '',
      additionalIds: [{ idDocument: null, role: '' }]
    };
  });
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    // Initialize with saved files if available, otherwise use defaults
    if (savedUploadedFiles) {
      console.log('[PDFUploadForm] Restoring saved uploaded files:', savedUploadedFiles);
      return savedUploadedFiles;
    }
    return {
      idDocument: null,
      selectedDocument: null
    };
  });
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [webhookResponse, setWebhookResponse] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isOneDriveUploading, setIsOneDriveUploading] = useState(false);
  
  // Get user email from authenticated user (supports multiple auth providers)
  const userEmail = user?.email || user?.username || user?.user_metadata?.email || '';
  
  // Check if Google Drive configuration is available (Service Account)
  const hasGoogleDriveConfig = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 
                              process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 
                              process.env.REACT_APP_GOOGLE_CLIENT_ID;
  
  // Choose between backend and direct service based on user preference
  const useDirectUpload = process.env.REACT_APP_USE_DIRECT_UPLOAD === 'true';
  const googleDriveServiceToUse = useDirectUpload ? googleDriveDirectService : googleDriveService;
  
  // Log user information for debugging
  console.log('[PDFUploadForm] User information:', {
    user: user,
    email: user?.email,
    username: user?.username,
    user_metadata: user?.user_metadata,
    extractedEmail: userEmail,
    hasGoogleDriveConfig: hasGoogleDriveConfig
  });
  
  // Debug environment variables
  console.log('[PDFUploadForm] Environment variables check:', {
    REACT_APP_GOOGLE_SERVICE_ACCOUNT_KEY_FILE: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_KEY_FILE ? 'SET' : 'NOT SET',
    GOOGLE_SERVICE_ACCOUNT_KEY_FILE: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE ? 'SET' : 'NOT SET',
    REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
    REACT_APP_USE_DIRECT_UPLOAD: process.env.REACT_APP_USE_DIRECT_UPLOAD,
    hasGoogleDriveConfig: hasGoogleDriveConfig,
    useDirectUpload: useDirectUpload
  });
  
  const fileInputRefs = {
    idDocument: useRef(null),
    selectedDocument: useRef(null)
  };

  // Save form data whenever it changes
  useEffect(() => {
    if (onFormDataSaved) {
      console.log('[PDFUploadForm] Saving form data:', { formData, uploadedFiles });
      onFormDataSaved(formData, uploadedFiles);
    }
  }, [formData, uploadedFiles, onFormDataSaved]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear selected document when document type changes
    if (field === 'documentType') {
      setUploadedFiles(prev => ({
        ...prev,
        selectedDocument: null
      }));
      if (fileInputRefs.selectedDocument.current) {
        fileInputRefs.selectedDocument.current.value = '';
      }
    }
  };

  // Handle additional ID changes
  const handleAdditionalIdChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalIds: prev.additionalIds.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // Add new additional ID
  const addAdditionalId = () => {
    setFormData(prev => ({
      ...prev,
      additionalIds: [...prev.additionalIds, { idDocument: null, role: '' }]
    }));
  };

  // Remove additional ID
  const removeAdditionalId = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalIds: prev.additionalIds.filter((_, i) => i !== index)
    }));
  };

  // Handle file selection
  const handleFileSelect = (event, fileType, index = null) => {
    const files = event.target.files;
    console.log(`[STEP 1] Files selected for ${fileType}:`, {
      count: files.length,
      names: Array.from(files).map(f => f.name),
      index: index
    });

    if (fileType === 'idDocument') {
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          setUploadedFiles(prev => ({
            ...prev,
            idDocument: file
          }));
        }
      }
    } else if (fileType === 'additionalIdDocument') {
      if (files.length > 0 && index !== null) {
        const file = files[0];
        if (validateFile(file)) {
          setFormData(prev => ({
            ...prev,
            additionalIds: prev.additionalIds.map((item, i) => 
              i === index ? { ...item, idDocument: file } : item
            )
          }));
        }
      }
    } else if (fileType === 'selectedDocument') {
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          setUploadedFiles(prev => ({
            ...prev,
            selectedDocument: file
          }));
        }
      }
    }
  };

  // Validate file
  const validateFile = (file) => {
    if (file.type !== 'application/pdf') {
      showError('Please select valid PDF files only.');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      showError('File size must be less than 10MB.');
      return false;
    }
    
    return true;
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, fileType, index = null) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (fileType === 'idDocument') {
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          setUploadedFiles(prev => ({
            ...prev,
            idDocument: file
          }));
        }
      }
    } else if (fileType === 'additionalIdDocument') {
      if (files.length > 0 && index !== null) {
        const file = files[0];
        if (validateFile(file)) {
          setFormData(prev => ({
            ...prev,
            additionalIds: prev.additionalIds.map((item, i) => 
              i === index ? { ...item, idDocument: file } : item
            )
          }));
        }
      }
    } else if (fileType === 'selectedDocument') {
      if (files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          setUploadedFiles(prev => ({
            ...prev,
            selectedDocument: file
          }));
        }
      }
    }
  };

  // Remove file
  const removeFile = (fileType, index = null) => {
    if (fileType === 'idDocument') {
      setUploadedFiles(prev => ({
        ...prev,
        idDocument: null
      }));
      if (fileInputRefs.idDocument.current) {
        fileInputRefs.idDocument.current.value = '';
      }
    } else if (fileType === 'additionalIdDocument') {
      setFormData(prev => ({
        ...prev,
        additionalIds: prev.additionalIds.map((item, i) => 
          i === index ? { ...item, idDocument: null } : item
        )
      }));
    } else if (fileType === 'selectedDocument') {
      setUploadedFiles(prev => ({
        ...prev,
        selectedDocument: null
      }));
      if (fileInputRefs.selectedDocument.current) {
        fileInputRefs.selectedDocument.current.value = '';
      }
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Show error
  const showError = (message) => {
    setResult({
      type: 'error',
      title: 'Upload Failed',
      message: message
    });
  };

  // Show success
  const showSuccess = (title, data = {}) => {
    console.log('[STEP 13] Processing success response data:', data);
    
    // Extract SessionId from the response
    let extractedSessionId = null;
    
    // Try to find SessionId in different possible locations
    if (data.SessionId) {
      extractedSessionId = data.SessionId;
      console.log('[STEP 13.1] Found SessionId in data.SessionId:', extractedSessionId);
    } else if (data.sessionId) {
      extractedSessionId = data.sessionId;
      console.log('[STEP 13.1] Found SessionId in data.sessionId:', extractedSessionId);
    } else if (data.session_id) {
      extractedSessionId = data.session_id;
      console.log('[STEP 13.1] Found SessionId in data.session_id:', extractedSessionId);
    } else if (data.body && data.body.SessionId) {
      extractedSessionId = data.body.SessionId;
      console.log('[STEP 13.1] Found SessionId in data.body.SessionId:', extractedSessionId);
    } else if (data.body && data.body.sessionId) {
      extractedSessionId = data.body.sessionId;
      console.log('[STEP 13.1] Found SessionId in data.body.sessionId:', extractedSessionId);
    } else if (data.body && data.body.session_id) {
      extractedSessionId = data.body.session_id;
      console.log('[STEP 13.1] Found SessionId in data.body.session_id:', extractedSessionId);
    }
    
    if (extractedSessionId) {
      console.log('[STEP 13.2] SessionId extracted successfully:', extractedSessionId);
      setSessionId(extractedSessionId);
      
      // Call the callback function to notify parent component
      if (onSessionIdReceived) {
        console.log('[STEP 13.3] Notifying parent component with SessionId:', extractedSessionId);
        onSessionIdReceived(extractedSessionId, data, formData, uploadedFiles);
      }
    } else {
      console.warn('[STEP 13.2] No SessionId found in response data');
      // Create a mock SessionId for testing if none is provided
      const mockSessionId = 'mock-session-' + Date.now();
      console.log('[STEP 13.2] Creating mock SessionId for testing:', mockSessionId);
      setSessionId(mockSessionId);
      
      // Call the callback function to notify parent component with mock SessionId
      if (onSessionIdReceived) {
        console.log('[STEP 13.3] Notifying parent component with mock SessionId:', mockSessionId);
        onSessionIdReceived(mockSessionId, data, formData, uploadedFiles);
      }
    }
    
    setResult({
      type: 'success',
      title: title,
      message: extractedSessionId 
        ? `Your documents have been successfully uploaded. Session ID: ${extractedSessionId}`
        : (data.message || 'Your documents have been successfully uploaded to the webhook.')
    });
    setWebhookResponse(data);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[STEP 5] Form submission started');
    
    // Enhanced configuration validation with detailed logging
    console.log('[STEP 5.1] Checking webhook configuration:', {
      hasUrl: !!webhookConfig.defaultUrl,
      hasApiKey: !!webhookConfig.defaultApiKey,
      url: webhookConfig.defaultUrl || 'NOT SET',
      apiKeyLength: webhookConfig.defaultApiKey?.length || 0,
      apiKeyPreview: webhookConfig.defaultApiKey ? `${webhookConfig.defaultApiKey.substring(0, 8)}...` : 'NOT SET'
    });
    
    if (!webhookConfig.defaultUrl) {
      console.error('[ERROR] Webhook URL not configured');
      console.error('[ERROR] Please create a .env file with REACT_APP_WEBHOOK_URL=your-make-webhook-url');
      showError('Webhook URL not configured. Please create a .env file with REACT_APP_WEBHOOK_URL=your-make-webhook-url');
      return;
    }
    
    if (!webhookConfig.defaultApiKey) {
      console.error('[ERROR] API key not configured');
      console.error('[ERROR] Please create a .env file with REACT_APP_WEBHOOK_API_KEY=your-make-api-key');
      showError('API key not configured. Please create a .env file with REACT_APP_WEBHOOK_API_KEY=your-make-api-key');
      return;
    }
    
    if (!uploadedFiles.idDocument) {
      console.error('[ERROR] Missing ID document');
      showError('Please upload the main ID document.');
      return;
    }
    
    if (!formData.mainIdRole) {
      console.error('[ERROR] Missing main ID role');
      showError('Please enter the role for the main ID document.');
      return;
    }
    
    if (!uploadedFiles.selectedDocument) {
      console.error('[ERROR] Missing selected document');
      showError('Please upload a document for the selected type.');
      return;
    }
    
    console.log('[STEP 6] Form validation passed, starting upload process');
    console.log('[STEP 6] Upload details:', {
      webhookUrl: webhookConfig.defaultUrl,
      apiKeyLength: webhookConfig.defaultApiKey?.length || 0,
      idDocumentName: uploadedFiles.idDocument.name,
      mainIdRole: formData.mainIdRole,
      additionalIdsCount: formData.additionalIds.filter(id => id.idDocument).length,
      selectedDocumentName: uploadedFiles.selectedDocument.name,
      documentType: formData.documentType
    });
    
    setIsUploading(true);
    setProgress(0);
    setResult(null);
    
    try {
      await uploadFiles(webhookConfig.defaultUrl);
    } catch (error) {
      console.error('[ERROR] Upload error:', error);
      console.error('[ERROR] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      showError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload files to OneDrive and send metadata to webhook
  const uploadFiles = async (webhookUrl) => {
    console.log('[STEP 7] Starting file upload process');
    console.log('[STEP 7.1] Before uploading to OneDrive - preparing files');
    
    // Generate a consistent session ID for this upload
    const uploadSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('[STEP 7.2] Generated upload session ID:', uploadSessionId);
    
    if (!userEmail) {
      console.error('[ERROR] User email is required for Google Drive upload');
      console.error('[ERROR] User object:', user);
      throw new Error('User email is required for Google Drive upload. Your account is logged in but no email address was found. Please contact support or try logging in with a different account.');
    }
    
    // Create documents array structure
    console.log('[STEP 8] Creating documents array structure');
    
    const documents = [];
    
    // Add main ID document
    console.log('[STEP 8.1] Adding main ID document to documents array');
    documents.push({
      file: uploadedFiles.idDocument,
      role: formData.mainIdRole,
      type: 'mainId'
    });
    console.log('[STEP 8.1] Main ID document added:', {
      fileName: uploadedFiles.idDocument.name,
      role: formData.mainIdRole,
      type: 'mainId'
    });
    
    // Add additional ID documents
    const additionalIdsWithDocuments = formData.additionalIds.filter(id => id.idDocument);
    console.log('[STEP 8.2] Adding additional ID documents to documents array:', additionalIdsWithDocuments.length);
    additionalIdsWithDocuments.forEach((additionalId, index) => {
      documents.push({
        file: additionalId.idDocument,
        role: additionalId.role,
        type: 'additionalId'
      });
      console.log(`[STEP 8.2] Additional ID document ${index + 1} added:`, {
        fileName: additionalId.idDocument.name,
        role: additionalId.role,
        type: 'additionalId'
      });
    });
    
    // Add selected document
    console.log('[STEP 8.3] Adding selected document to documents array');
    documents.push({
      file: uploadedFiles.selectedDocument,
      role: '',
      type: formData.documentType
    });
    console.log('[STEP 8.3] Selected document added:', {
      fileName: uploadedFiles.selectedDocument.name,
      role: '',
      type: formData.documentType
    });
    
    console.log('[STEP 8.4] Documents array created with', documents.length, 'documents');
    console.log('[STEP 8.4.1] Documents array structure:', documents.map(doc => ({
      fileName: doc.file.name,
      role: doc.role,
      type: doc.type
    })));
    
    // Upload files to Google Drive
    console.log('[STEP 8.5] Starting Google Drive upload process');
    setIsOneDriveUploading(true);
    
    // Initialize variables that will be used outside the try block
    let uploadFormData = null;
    let documentsArray = [];
    let sessionFolderName = '';
    
    // Check if Google Drive configuration is available (Service Account)
    const hasGoogleDriveConfig = process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 
                                process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 
                                process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    console.log('[STEP 8.5.1] Google Drive configuration check:', {
      hasReactAppServiceAccountKey: !!process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      hasServiceAccountKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
      hasClientId: !!process.env.REACT_APP_GOOGLE_CLIENT_ID,
      hasGoogleDriveConfig: hasGoogleDriveConfig,
      reactAppServiceAccountKey: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_KEY_FILE ? 'SET' : 'NOT SET',
      serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE ? 'SET' : 'NOT SET',
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET'
    });
    
    if (!hasGoogleDriveConfig) {
      console.warn('[STEP 8.5.2] Google Drive configuration missing, using fallback mode');
      console.warn('[STEP 8.5.2] Please ensure service-account-key.json exists and add to .env:');
      console.warn('[STEP 8.5.2] GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json');
      
      // Create fallback documents array without Google Drive
      documentsArray = documents.map((doc, index) => ({
        itemId: index,
        filename: doc.file.name,
        fileType: doc.file.type || 'application/pdf',
        docType: doc.type,
        role: doc.role,
        googleDriveFileId: `fallback-${Date.now()}-${index}`,
        googleDriveWebUrl: `https://example.com/fallback/${doc.file.name}`,
        googleDriveDownloadUrl: `https://example.com/fallback/${doc.file.name}`,
        fileSize: doc.file.size,
        lastModified: new Date().toISOString()
      }));
      
      sessionFolderName = `fallback-session-${Date.now()}`;
    } else {
      try {
        // Create organized folder structure
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const baseFolderPath = `PDF-Uploads/${today}/${uploadSessionId}`;
        
        console.log('[STEP 8.6] Creating organized Google Drive folder structure:', baseFolderPath);
        
        // Organize files by type
        const mainIdFiles = documents.filter(doc => doc.type === 'mainId');
        const additionalIdFiles = documents.filter(doc => doc.type === 'additionalId');
        const certificateFiles = documents.filter(doc => doc.type === 'incorporation' || doc.type === 'certificate');
        
        console.log('[STEP 8.6.1] Files organized by type:', {
          mainId: mainIdFiles.length,
          additionalId: additionalIdFiles.length,
          certificate: certificateFiles.length
        });
        
        // Upload files to their respective folders
        const allResults = [];
        
        // Get access token for direct upload if needed
        if (useDirectUpload) {
          console.log('[STEP 8.6.5] Getting access token for direct upload');
          await googleDriveServiceToUse.getAccessToken(user);
        }
        
        // Upload main ID files
        if (mainIdFiles.length > 0) {
          console.log('[STEP 8.7.1] Uploading main ID files to main-id folder');
          const mainIdResults = await googleDriveServiceToUse.uploadMultipleFiles(mainIdFiles, userEmail, `${baseFolderPath}/main-id`);
          allResults.push(...mainIdResults.uploadResults);
        }
        
        // Upload additional ID files
        if (additionalIdFiles.length > 0) {
          console.log('[STEP 8.7.2] Uploading additional ID files to additional-ids folder');
          const additionalIdResults = await googleDriveServiceToUse.uploadMultipleFiles(additionalIdFiles, userEmail, `${baseFolderPath}/additional-ids`);
          allResults.push(...additionalIdResults.uploadResults);
        }
        
        // Upload certificate files
        if (certificateFiles.length > 0) {
          console.log('[STEP 8.7.3] Uploading certificate files to certificate folder');
          const certificateResults = await googleDriveServiceToUse.uploadMultipleFiles(certificateFiles, userEmail, `${baseFolderPath}/certificate`);
          allResults.push(...certificateResults.uploadResults);
        }
        
        console.log('[STEP 8.8] Google Drive upload completed:', {
          successful: allResults.length,
          total: documents.length,
          folderStructure: baseFolderPath
        });
        
        // Create documents array with Google Drive URLs
        console.log('[STEP 8.9] Creating documents array with Google Drive URLs');
        documentsArray = allResults.map((result, index) => ({
          itemId: result.originalIndex,
          filename: result.fileName,
          fileType: 'application/pdf',
          docType: result.type,
          role: result.role,
          googleDriveFileId: result.fileId,
          googleDriveWebUrl: result.webUrl,
          googleDriveDownloadUrl: result.downloadUrl,
          fileSize: result.size,
          lastModified: result.lastModified
        }));
        
        sessionFolderName = baseFolderPath;
      } catch (googleDriveError) {
        console.error('[ERROR] Google Drive upload failed:', googleDriveError);
        // Fallback to basic document structure
        documentsArray = documents.map((doc, index) => ({
          itemId: index,
          filename: doc.file.name,
          fileType: doc.file.type || 'application/pdf',
          docType: doc.type,
          role: doc.role,
          googleDriveFileId: `error-${Date.now()}-${index}`,
          googleDriveWebUrl: `https://example.com/error/${doc.file.name}`,
          googleDriveDownloadUrl: `https://example.com/error/${doc.file.name}`,
          fileSize: doc.file.size,
          lastModified: new Date().toISOString()
        }));
        
        sessionFolderName = `error-session-${Date.now()}`;
      }
    }
    
    console.log('[STEP 8.9] Documents array created:', documentsArray.map(doc => ({
      itemId: doc.itemId,
      filename: doc.filename,
      docType: doc.docType,
      role: doc.role,
      googleDriveFileId: doc.googleDriveFileId,
      googleDriveWebUrl: doc.googleDriveWebUrl
    })));
    
    // Create JSON payload for webhook
    console.log('[STEP 9] Creating JSON payload for webhook');
    
    // Prepare the JSON payload - send as array for Make.com iterator
    const webhookPayload = [
      {
        documents: documentsArray,
        documentType: formData.documentType,
        timestamp: new Date().toISOString(),
        totalFiles: documentsArray.length,
        googleDriveSessionFolder: sessionFolderName,
        userEmail: userEmail,
        apiKey: webhookConfig.defaultApiKey,
        key: webhookConfig.defaultApiKey
      }
    ];
    
    console.log('[STEP 9.1] JSON payload created:', {
      payloadType: 'Array for Make.com iterator',
      documentsCount: documentsArray.length,
      documentType: formData.documentType,
      googleDriveSessionFolder: sessionFolderName,
      userEmail: userEmail,
      documents: documentsArray.map((doc, index) => ({
        itemId: doc.itemId,
        filename: doc.filename,
        docType: doc.docType,
        role: doc.role,
        googleDriveFileId: doc.googleDriveFileId,
        googleDriveWebUrl: doc.googleDriveWebUrl
      }))
    });
    
    console.log('[STEP 9.3] Form data added:', {
      timestamp: new Date().toISOString(),
      totalFiles: documentsArray.length,
      documentType: formData.documentType,
      googleDriveSessionFolder: sessionFolderName,
      userEmail: userEmail,
      documents: documentsArray.map((doc, index) => ({
        itemId: doc.itemId,
        filename: doc.filename,
        docType: doc.docType,
        role: doc.role,
        googleDriveFileId: doc.googleDriveFileId,
        googleDriveWebUrl: doc.googleDriveWebUrl
      }))
    });
    
    // Log JSON payload for debugging
    console.log('[STEP 9.1] JSON payload details:');
    console.log('  documents:', webhookPayload[0].documents.length, 'items');
    console.log('  documentType:', webhookPayload[0].documentType);
    console.log('  totalFiles:', webhookPayload[0].totalFiles);
    console.log('  oneDriveSessionFolder:', webhookPayload[0].oneDriveSessionFolder);
    console.log('  userEmail:', webhookPayload[0].userEmail);
    
    console.log('Upload request details:', {
      webhookUrl: webhookConfig.defaultUrl,
      googleDriveSessionFolder: sessionFolderName,
      userEmail: userEmail,
      documents: documentsArray.map(doc => ({
        itemId: doc.itemId,
        filename: doc.filename,
        docType: doc.docType,
        role: doc.role,
        googleDriveFileId: doc.googleDriveFileId,
        googleDriveWebUrl: doc.googleDriveWebUrl
      })),
      totalDocuments: documentsArray.length
    });
    
    // Continue with webhook upload
    console.log('[STEP 10] Google Drive upload completed, sending metadata to webhook');
    
    // Check if we have the required data for webhook upload
    if (!documentsArray || documentsArray.length === 0) {
      console.error('[ERROR] No documents to upload:', { documentsArray });
      throw new Error('No documents prepared for upload. Please check your file selections.');
    }
    
    if (!webhookPayload || !webhookPayload[0]) {
      console.error('[ERROR] Webhook payload not prepared:', { webhookPayload });
      throw new Error('Failed to prepare webhook payload. Please try again.');
    }
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          return prev + 10;
        }
        return prev;
      });
    }, 200);
    
    // Mark Google Drive upload as completed
    setIsOneDriveUploading(false);
    
    try {
      console.log('[STEP 10] About to send HTTP request');
      console.log('[STEP 10.1] Before sending request - final preparation');
      console.log('[STEP 10] Request details:', {
        url: webhookConfig.defaultUrl,
        method: 'POST',
        apiKeyHeader: 'x-make-apikey',
        apiKeyLength: webhookConfig.defaultApiKey?.length || 0,
        apiKeyPreview: webhookConfig.defaultApiKey ? `${webhookConfig.defaultApiKey.substring(0, 8)}...` : 'NOT SET',
        payload: {
          payloadType: 'Array for Make.com iterator',
          documentsCount: webhookPayload[0].documents.length,
          documentType: webhookPayload[0].documentType,
          totalFiles: webhookPayload[0].totalFiles,
          oneDriveSessionFolder: webhookPayload[0].oneDriveSessionFolder,
          userEmail: webhookPayload[0].userEmail
        }
      });
      
      // Validate API key before sending
      if (!webhookConfig.defaultApiKey) {
        throw new Error('API key is not configured. Please check your REACT_APP_WEBHOOK_API_KEY environment variable.');
      }
      
      // Log API key details for debugging
      console.log('[STEP 10.1] API Key validation:', {
        exists: !!webhookConfig.defaultApiKey,
        length: webhookConfig.defaultApiKey?.length || 0,
        startsWith: webhookConfig.defaultApiKey?.substring(0, 4) || 'N/A',
        endsWith: webhookConfig.defaultApiKey?.substring(-4) || 'N/A',
        containsSpaces: webhookConfig.defaultApiKey?.includes(' ') || false,
        containsSpecialChars: /[^a-zA-Z0-9-_]/.test(webhookConfig.defaultApiKey || '') || false
      });
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhookConfig.timeout || 30000);
      
      console.log('[STEP 11] Request headers sent:', {
        'Authorization': `Bearer ${webhookConfig.defaultApiKey ? webhookConfig.defaultApiKey.substring(0, 8) + '...' : 'NOT SET'}`,
        'x-api-key': webhookConfig.defaultApiKey ? `${webhookConfig.defaultApiKey.substring(0, 8)}...` : 'NOT SET',
        'x-make-apikey': webhookConfig.defaultApiKey ? `${webhookConfig.defaultApiKey.substring(0, 8)}...` : 'NOT SET',
        'Content-Type': 'application/json'
      });
      
      console.log('[STEP 11.1] Webhook URL:', webhookConfig.defaultUrl);
      
      // Try with headers first, if that fails, try without headers
      let response;
      console.log('[STEP 11] Sending HTTP request with headers');
      console.log('[STEP 11] Webhook URL:', webhookConfig.defaultUrl);
      console.log('[STEP 11] Payload size:', JSON.stringify(webhookPayload).length, 'characters');
      
      try {
        console.log('[STEP 11.1] Attempting request with headers...');
        response = await fetch(webhookConfig.defaultUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${webhookConfig.defaultApiKey}`,
            'x-api-key': webhookConfig.defaultApiKey,
            'x-make-apikey': webhookConfig.defaultApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(webhookPayload),
          signal: controller.signal
        });
        console.log('[STEP 11] HTTP request sent successfully with headers');
        console.log('[STEP 11] Response status:', response.status);
      } catch (error) {
        console.error('[STEP 11.2] First attempt failed with error:', error.message);
        console.log('[STEP 11.2] Trying without headers...');
        try {
          response = await fetch(webhookConfig.defaultUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload),
            signal: controller.signal
          });
          console.log('[STEP 11.2] HTTP request sent successfully without headers');
          console.log('[STEP 11.2] Response status:', response.status);
        } catch (secondError) {
          console.error('[STEP 11.2] Second attempt also failed:', secondError.message);
          throw new Error(`Webhook request failed: ${secondError.message}`);
        }
      }
      
      clearTimeout(timeoutId);
      
      console.log('[STEP 11] HTTP request sent successfully');
      console.log('[STEP 11.3] Response received from webhook');
      console.log('[STEP 11] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Log detailed response info for debugging
      console.log('[STEP 11.4] Response headers details:');
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.ok) {
        console.log('[STEP 12] Response is successful (status 200-299)');
        console.log('[STEP 12.1] Processing successful response');
        const responseData = await response.json().catch(() => ({}));
        
        console.log('[STEP 12.2] Response data:', responseData);
        console.log('[STEP 12.2.0] Response data type:', typeof responseData);
        console.log('[STEP 12.2.0.1] Response data is array:', Array.isArray(responseData));
        console.log('[STEP 12.2.0.2] Response data length:', responseData?.length);
        
        // Parse the response from Make.com - it comes as an array with body as JSON string
        let parsedResponse = {};
        if (responseData && Array.isArray(responseData) && responseData.length > 0) {
          console.log('[STEP 12.2.0.3] First element of response array:', responseData[0]);
          console.log('[STEP 12.2.0.4] Body content:', responseData[0].body);
          try {
            // Parse the body which contains the actual response data
            let bodyContent = responseData[0].body;
            console.log('[STEP 12.2.1.0] Raw body content before parsing:', bodyContent);
            
            // Try to fix common JSON syntax errors
            // Remove extra quotes at the end of lines
            bodyContent = bodyContent.replace(/"\s*"\s*\r?\n/g, '"\r\n');
            // Remove trailing quotes before closing brace
            bodyContent = bodyContent.replace(/"\s*"\s*}/g, '"}');
            // Remove trailing quotes before closing bracket
            bodyContent = bodyContent.replace(/"\s*"\s*]/g, '"]');
            
            console.log('[STEP 12.2.1.0.1] Cleaned body content:', bodyContent);
            
            parsedResponse = JSON.parse(bodyContent);
            console.log('[STEP 12.2.1] Parsed response body:', parsedResponse);
            console.log('[STEP 12.2.1.1] Parsed response keys:', Object.keys(parsedResponse));
          } catch (parseError) {
            console.error('[STEP 12.2.1] Failed to parse response body:', parseError);
            console.error('[STEP 12.2.1.1] Raw body content:', responseData[0].body);
            console.error('[STEP 12.2.1.2] Parse error details:', parseError.message);
            
            // Try alternative parsing methods
            try {
              console.log('[STEP 12.2.1.3] Trying to extract SessionId manually...');
              const bodyText = responseData[0].body;
              const sessionIdMatch = bodyText.match(/"SessionId":\s*"([^"]+)"/);
              if (sessionIdMatch) {
                const extractedSessionId = sessionIdMatch[1];
                console.log('[STEP 12.2.1.4] Manually extracted SessionId:', extractedSessionId);
                parsedResponse = { SessionId: extractedSessionId };
              } else {
                console.error('[STEP 12.2.1.4] Could not extract SessionId manually');
                parsedResponse = {};
              }
            } catch (manualError) {
              console.error('[STEP 12.2.1.5] Manual extraction also failed:', manualError);
              parsedResponse = {};
            }
          }
        } else {
          console.warn('[STEP 12.2.1] Response is not in expected format, using responseData directly');
          parsedResponse = responseData;
        }
        
        // Extract session ID from parsed response - ONLY use the one from the webhook response
        const sessionId = parsedResponse.SessionId || parsedResponse.sessionId || parsedResponse.session_id || parsedResponse.id;
        console.log('[STEP 12.3] Session ID extracted from response:', sessionId);
        
        if (!sessionId) {
          console.error('[STEP 12.3] No SessionId found in webhook response!');
          console.error('[STEP 12.3.1] Parsed response keys:', Object.keys(parsedResponse));
          console.error('[STEP 12.3.2] Full parsed response:', parsedResponse);
          throw new Error('No SessionId received from webhook response. Cannot proceed without valid SessionId.');
        }
        
        console.log('[STEP 12.3.3] Using SessionId from webhook response:', sessionId);
        
        // Show success message
        showSuccess('הקבצים הועלו בהצלחה!', {
          sessionId: sessionId,
          totalFiles: documentsArray.length,
          googleDriveSessionFolder: sessionFolderName,
          responseData: responseData,
          parsedResponse: parsedResponse
        });
        
        console.log('[STEP 12.4] Final session ID for this upload:', sessionId);
        console.log('[STEP 12.4.1] Session ID source:', {
          fromWebhook: sessionId,
          webhookResponseKeys: Object.keys(parsedResponse),
          finalSessionId: sessionId
        });
        
        // Call the callback with session ID and data
        if (onSessionIdReceived) {
          console.log('[STEP 12.4] Calling onSessionIdReceived callback');
          onSessionIdReceived(sessionId, responseData, formData, uploadedFiles);
        }
        
        // Save form data for potential resend
        if (onFormDataSaved) {
          console.log('[STEP 12.5] Saving form data for potential resend');
          onFormDataSaved(formData, uploadedFiles);
        }
        
        console.log('[STEP 13] Upload process completed successfully');
        
      } else {
        console.error('[STEP 12] Response is not successful');
        console.error('[STEP 12.1] Error response details:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        // Try to get error details from response
        let errorDetails = '';
        try {
          const errorData = await response.text();
          errorDetails = errorData;
          console.error('[STEP 12.2] Error response body:', errorData);
        } catch (e) {
          console.error('[STEP 12.2] Could not read error response body:', e);
        }
        
        throw new Error(`Webhook request failed with status ${response.status}: ${response.statusText}. ${errorDetails}`);
      }
      
    } catch (error) {
      console.error('[ERROR] Webhook request failed:', error);
      clearInterval(progressInterval);
      setProgress(0);
      setIsOneDriveUploading(false);
      throw error;
    }
  };

  // Reset form
  const resetForm = () => {
    console.log('[RESET] Resetting form to default values');
    const defaultFormData = {
      documentType: 'incorporation',
      mainIdRole: '',
      additionalIds: [{ idDocument: null, role: '' }]
    };
    const defaultUploadedFiles = {
      idDocument: null,
      selectedDocument: null
    };
    
    setFormData(defaultFormData);
    setUploadedFiles(defaultUploadedFiles);
    setProgress(0);
    setResult(null);
    setWebhookResponse(null);
    setSessionId(null);
    
    // Clear saved data in parent component
    if (onFormDataSaved) {
      onFormDataSaved(null, null);
    }
    
    // Reset file inputs
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) {
        ref.current.value = '';
      }
    });
    console.log('[RESET] Form reset completed');
  };

  // Check if form is ready to submit
  const isFormReady = webhookConfig.defaultUrl && 
                     webhookConfig.defaultApiKey && 
                     userEmail && // User must be logged in
                     uploadedFiles.idDocument && 
                     formData.mainIdRole &&
                     uploadedFiles.selectedDocument;

  // Get document type display name
  const getDocumentTypeName = (type) => {
    switch (type) {
      case 'incorporation':
        return 'התאגדות';
      case 'authorization':
        return 'מורשה';
      case 'exemption':
        return 'פטור';
      default:
        return type;
    }
  };

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <div className="pdf-upload-form">
        <div className="config-status">
          <h3>Authentication Required</h3>
          <div className="status-grid">
            <div className="status-item error">
              <i className="fas fa-times-circle"></i>
              <span>User Authentication: Not Logged In</span>
            </div>
          </div>
          <div className="config-help">
            <p><strong>Please log in to continue:</strong></p>
            <p>You must be logged in to upload files to Google Drive. Please use the login button in the header to authenticate.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-upload-form">
      {/* Configuration Status */}
      <div className="config-status">
        <h3>Webhook Configuration Status</h3>
        <div className="status-grid">
          <div className={`status-item ${webhookConfig.defaultUrl ? 'success' : 'error'}`}>
            <i className={`fas ${webhookConfig.defaultUrl ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            <span>Webhook URL: {webhookConfig.defaultUrl ? 'Configured' : 'Not Configured'}</span>
          </div>
          <div className={`status-item ${webhookConfig.defaultApiKey ? 'success' : 'error'}`}>
            <i className={`fas ${webhookConfig.defaultApiKey ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            <span>API Key: {webhookConfig.defaultApiKey ? 'Configured' : 'Not Configured'}</span>
          </div>
          <div className={`status-item ${userEmail ? 'success' : 'error'}`}>
            <i className={`fas ${userEmail ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
            <span>User Authentication: {userEmail ? 'Logged In' : 'Not Logged In'}</span>
          </div>
          <div className={`status-item ${hasGoogleDriveConfig ? 'success' : 'error'}`}>
            <i className={`fas ${hasGoogleDriveConfig ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
            <span>Google Drive Upload: {hasGoogleDriveConfig ? 'Ready' : 'Configuration Missing'}</span>
          </div>
        </div>
        {(!webhookConfig.defaultUrl || !webhookConfig.defaultApiKey) && (
          <div className="config-help">
            <p><strong>To fix this:</strong></p>
            <ol>
              <li>Create a <code>.env</code> file in the project root</li>
              <li>Add your Make.com webhook configuration:</li>
              <pre>
{`REACT_APP_WEBHOOK_URL=https://hook.us2.make.com/your-webhook-url
REACT_APP_WEBHOOK_API_KEY=your-webhook-api-key`}
              </pre>
              <li>Restart the development server</li>
            </ol>
          </div>
        )}
        {!userEmail && (
          <div className="config-help">
            <p><strong>Email Not Found:</strong></p>
            <p>Your account is logged in but no email address was found. This might be due to:</p>
            <ul>
              <li>Google account without email</li>
              <li>Approved user account without email</li>
              <li>Authentication provider configuration issue</li>
            </ul>
            <p><strong>Current user status:</strong> {user ? 'User object exists but no email found' : 'No user logged in'}</p>
          </div>
        )}
        {!hasGoogleDriveConfig && (
          <div className="config-help">
            <p><strong>Google Drive Configuration Missing:</strong></p>
            <p>To enable Google Drive uploads, you need to configure Google Service Account:</p>
            <ol>
              <li>Ensure <code>service-account-key.json</code> exists in the project root</li>
              <li>Add the following to your <code>.env</code> file:</li>
              <pre>
{`GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json`}
              </pre>
              <li>Restart the development server</li>
            </ol>
            <p><strong>Note:</strong> The system will work in fallback mode without Google Drive configuration, but files won't be uploaded to Google Drive.</p>
          </div>
        )}
      </div>

      <form id="pdf-upload-form" onSubmit={handleSubmit} className="upload-form">
        {/* User Info Display */}
        {userEmail && (
          <div className="form-section">
            <h2 className="section-title">פרטי משתמש</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-envelope"></i>
                  כתובת אימייל
                </label>
                <div className="user-email-display">
                  <span className="user-email">{userEmail}</span>
                  <small className="form-help">מחובר כעת - נדרש להעלאת קבצים ל-Google Drive</small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main ID Document Upload */}
        <div className="form-section">
          <h2 className="section-title">תעודת זהות ראשית</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <i className="fas fa-user-tag"></i>
                תפקיד
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.mainIdRole}
                onChange={(e) => handleInputChange('mainIdRole', e.target.value)}
                placeholder="הכנס תפקיד"
                required
              />
            </div>
          </div>

          <div className="upload-section">
            <h3>מסמך תעודת זהות ראשית</h3>
            <div 
              className="upload-card" 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'idDocument')}
            >
              {!uploadedFiles.idDocument ? (
                <div 
                  className="upload-area"
                  onClick={() => fileInputRefs.idDocument.current?.click()}
                >
                  <i className="fas fa-cloud-upload-alt upload-icon"></i>
                  <h3>תעודת זהות ראשית</h3>
                  <p>לחץ או גרור להעלאה</p>
                  <input 
                    type="file" 
                    ref={fileInputRefs.idDocument}
                    id="id-document-input"
                    name="idDocument"
                    accept=".pdf" 
                    style={{ display: 'none' }}
                    className="file-input"
                    onChange={(e) => handleFileSelect(e, 'idDocument')}
                    required
                  />
                </div>
              ) : (
                <div className="file-info">
                  <div className="file-details">
                    <i className="fas fa-file-pdf file-icon"></i>
                    <div className="file-text">
                      <span className="file-name">{uploadedFiles.idDocument.name}</span>
                      <span className="file-size">{formatFileSize(uploadedFiles.idDocument.size)}</span>
                    </div>
                    <button 
                      type="button" 
                      className="remove-btn" 
                      onClick={() => removeFile('idDocument')}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional ID Documents */}
        <div className="form-section">
          <h2 className="section-title">תעודות זהות נוספות</h2>
          
          {formData.additionalIds.map((additionalId, index) => (
            <div key={index} className="additional-id-row">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <i className="fas fa-user-tag"></i>
                    תפקיד {index + 1}
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={additionalId.role}
                    onChange={(e) => handleAdditionalIdChange(index, 'role', e.target.value)}
                    placeholder="הכנס תפקיד"
                  />
                </div>
                
                {formData.additionalIds.length > 1 && (
                  <button
                    type="button"
                    className="remove-id-btn"
                    onClick={() => removeAdditionalId(index)}
                  >
                    <i className="fas fa-trash"></i>
                    הסר
                  </button>
                )}
              </div>

              <div className="upload-section">
                <h3>מסמך תעודת זהות {index + 1}</h3>
                <div 
                  className="upload-card" 
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'additionalIdDocument', index)}
                >
                  {!additionalId.idDocument ? (
                    <div 
                      className="upload-area"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf';
                        input.onchange = (e) => handleFileSelect(e, 'additionalIdDocument', index);
                        input.click();
                      }}
                    >
                      <i className="fas fa-cloud-upload-alt upload-icon"></i>
                      <h3>תעודת זהות {index + 1}</h3>
                      <p>לחץ או גרור להעלאה</p>
                    </div>
                  ) : (
                    <div className="file-info">
                      <div className="file-details">
                        <i className="fas fa-file-pdf file-icon"></i>
                        <div className="file-text">
                          <span className="file-name">{additionalId.idDocument.name}</span>
                          <span className="file-size">{formatFileSize(additionalId.idDocument.size)}</span>
                        </div>
                        <button 
                          type="button" 
                          className="remove-btn" 
                          onClick={() => removeFile('additionalIdDocument', index)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            className="add-id-btn"
            onClick={addAdditionalId}
          >
            <i className="fas fa-plus"></i>
            הוסף תעודת זהות נוספת
          </button>
        </div>

        {/* Document Type Selection and Upload */}
        <div className="form-section">
          <h2 className="section-title">סוג מסמך והעלאה</h2>
          
          {/* Document Type Selection */}
          <div className="document-type-selection">
            <label className={`document-type-option ${formData.documentType === 'incorporation' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="documentType"
                value="incorporation"
                checked={formData.documentType === 'incorporation'}
                onChange={(e) => handleInputChange('documentType', e.target.value)}
              />
              <div className="option-content">
                <i className="fas fa-building"></i>
                <span>התאגדות</span>
              </div>
            </label>
            
            <label className={`document-type-option ${formData.documentType === 'authorization' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="documentType"
                value="authorization"
                checked={formData.documentType === 'authorization'}
                onChange={(e) => handleInputChange('documentType', e.target.value)}
              />
              <div className="option-content">
                <i className="fas fa-user-shield"></i>
                <span>מורשה</span>
              </div>
            </label>
            
            <label className={`document-type-option ${formData.documentType === 'exemption' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="documentType"
                value="exemption"
                checked={formData.documentType === 'exemption'}
                onChange={(e) => handleInputChange('documentType', e.target.value)}
              />
              <div className="option-content">
                <i className="fas fa-shield-alt"></i>
                <span>פטור</span>
              </div>
            </label>
          </div>

          {/* Selected Document Upload */}
          <div className="upload-section">
            <h3>מסמך {getDocumentTypeName(formData.documentType)}</h3>
            <div 
              className="upload-card" 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'selectedDocument')}
            >
              {!uploadedFiles.selectedDocument ? (
                <div 
                  className="upload-area"
                  onClick={() => fileInputRefs.selectedDocument.current?.click()}
                >
                  <i className="fas fa-cloud-upload-alt upload-icon"></i>
                  <h3>מסמך {getDocumentTypeName(formData.documentType)}</h3>
                  <p>לחץ או גרור להעלאה</p>
                  <input 
                    type="file" 
                    ref={fileInputRefs.selectedDocument}
                    id="selected-document-input"
                    name="selectedDocument"
                    accept=".pdf" 
                    style={{ display: 'none' }}
                    className="file-input"
                    onChange={(e) => handleFileSelect(e, 'selectedDocument')}
                    required
                  />
                </div>
              ) : (
                <div className="file-info">
                  <div className="file-details">
                    <i className="fas fa-file-pdf file-icon"></i>
                    <div className="file-text">
                      <span className="file-name">{uploadedFiles.selectedDocument.name}</span>
                      <span className="file-size">{formatFileSize(uploadedFiles.selectedDocument.size)}</span>
                    </div>
                    <button 
                      type="button" 
                      className="remove-btn" 
                      onClick={() => removeFile('selectedDocument')}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={!isFormReady || isUploading || isOneDriveUploading}
          >
            {isOneDriveUploading ? (
              <>
                <i className="fas fa-cloud-upload-alt fa-spin"></i>
                מעלה ל-Google Drive...
              </>
            ) : isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                שולח למעבד...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                שלח מסמכים
              </>
            )}
          </button>
        </div>
      </form>

      {/* Progress Bar */}
      {(isUploading || isOneDriveUploading) && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {isOneDriveUploading ? 'מעלה קבצים ל-Google Drive...' : 'שולח למעבד...'}
          </p>
        </div>
      )}

      {/* Result Message */}
      {result && (
        <div className={`result-container ${result.type}`}>
          <div className="result-icon">
            {result.type === 'success' ? (
              <i className="fas fa-check-circle success"></i>
            ) : (
              <i className="fas fa-exclamation-circle error"></i>
            )}
          </div>
          <h3>{result.title}</h3>
          <p>{result.message}</p>
        </div>
      )}

      {/* Webhook Response Display */}
      {webhookResponse && (
        <div className="webhook-response">
          <h3 className="response-title">
            <i className="fas fa-server"></i>
            תגובת Webhook
          </h3>
          
          <div className="response-details">
            <div className="response-section">
              <h4>סטטוס</h4>
              <div className="status-info">
                <span className={`status-badge ${webhookResponse.status >= 200 && webhookResponse.status < 300 ? 'success' : 'error'}`}>
                  {webhookResponse.status} {webhookResponse.statusText}
                </span>
              </div>
            </div>

            {sessionId && (
              <div className="response-section">
                <h4>מזהה סשן</h4>
                <div className="session-id-info">
                  <span className="session-id-badge">{sessionId}</span>
                  <button 
                    className="view-documents-btn"
                    onClick={() => onSessionIdReceived && onSessionIdReceived(sessionId, webhookResponse, formData, uploadedFiles)}
                  >
                    <i className="fas fa-eye"></i>
                    צפה במסמכים
                  </button>
                </div>
              </div>
            )}

            {webhookResponse.headers && Object.keys(webhookResponse.headers).length > 0 && (
              <div className="response-section">
                <h4>כותרות תגובה</h4>
                <div className="headers-list">
                  {Object.entries(webhookResponse.headers).map(([key, value]) => (
                    <div key={key} className="header-item">
                      <span className="header-key">{key}:</span>
                      <span className="header-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(webhookResponse).filter(key => !['status', 'statusText', 'headers'].includes(key)).length > 0 && (
              <div className="response-section">
                <h4>נתוני תגובה</h4>
                <div className="response-data">
                  <pre>{JSON.stringify(webhookResponse, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUploadForm; 