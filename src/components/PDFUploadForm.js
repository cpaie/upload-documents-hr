import React, { useState, useRef, useEffect } from 'react';
import { webhookConfig } from '../config/webhook.config';
import cloudStorageService from '../services/googleCloudStorageService';
import './PDFUploadForm.css';

const PDFUploadForm = ({ onSessionIdReceived, savedFormData, savedUploadedFiles, onFormDataSaved, user, cameFromDocumentsView, currentSessionId }) => {
  const [formData, setFormData] = useState(() => {
    // Initialize with saved data if available, otherwise use defaults
    if (savedFormData) {
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
  const [isCloudStorageUploading, setIsCloudStorageUploading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [originalUploadedFiles, setOriginalUploadedFiles] = useState(null);
  
  // Get user email from authenticated user (supports multiple auth providers)
  const userEmail = user?.email || user?.username || user?.user_metadata?.email || '';
  
  // Check if Google Cloud Storage configuration is available
  const hasCloudStorageConfig = process.env.REACT_APP_GCS_PROJECT_ID &&
                               process.env.REACT_APP_GCS_BUCKET_NAME;
  

  
  const fileInputRefs = {
    idDocument: useRef(null),
    selectedDocument: useRef(null)
  };

  // Save form data whenever it changes
  useEffect(() => {
    if (onFormDataSaved) {
      onFormDataSaved(formData, uploadedFiles);
    }
  }, [formData, uploadedFiles, onFormDataSaved]);

  // Set original data when coming from DocumentsView
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (cameFromDocumentsView && originalFormData === null && originalUploadedFiles === null) {
      if (savedFormData && savedUploadedFiles) {
        setOriginalFormData(JSON.parse(JSON.stringify(savedFormData)));
        setOriginalUploadedFiles({
          idDocument: savedUploadedFiles.idDocument,
          selectedDocument: savedUploadedFiles.selectedDocument
        });
      } else {
        setOriginalFormData(JSON.parse(JSON.stringify(formData)));
        setOriginalUploadedFiles({
          idDocument: uploadedFiles.idDocument,
          selectedDocument: uploadedFiles.selectedDocument
        });
      }
    }
    // When not coming from DocumentsView, clear original data
    if (!cameFromDocumentsView && (originalFormData !== null || originalUploadedFiles !== null)) {
      setOriginalFormData(null);
      setOriginalUploadedFiles(null);
    }
  }, [cameFromDocumentsView, savedFormData, savedUploadedFiles]); // Removed formData and uploadedFiles from dependencies

  // Check for changes whenever form contents or uploaded files change
  useEffect(() => {
    if (originalFormData && originalUploadedFiles && cameFromDocumentsView) {
      // Compare form data more carefully
      const formDataChanged = 
        formData.documentType !== originalFormData.documentType ||
        formData.mainIdRole !== originalFormData.mainIdRole ||
        JSON.stringify(formData.additionalIds) !== JSON.stringify(originalFormData.additionalIds);
      
      // Compare files more carefully
      const idDocChanged = 
        (uploadedFiles.idDocument && !originalUploadedFiles.idDocument) ||
        (!uploadedFiles.idDocument && originalUploadedFiles.idDocument) ||
        (uploadedFiles.idDocument && originalUploadedFiles.idDocument && 
         (uploadedFiles.idDocument.name !== originalUploadedFiles.idDocument.name ||
          uploadedFiles.idDocument.size !== originalUploadedFiles.idDocument.size));
      
      const selectedDocChanged = 
        (uploadedFiles.selectedDocument && !originalUploadedFiles.selectedDocument) ||
        (!uploadedFiles.selectedDocument && originalUploadedFiles.selectedDocument) ||
        (uploadedFiles.selectedDocument && originalUploadedFiles.selectedDocument && 
         (uploadedFiles.selectedDocument.name !== originalUploadedFiles.selectedDocument.name ||
          uploadedFiles.selectedDocument.size !== originalUploadedFiles.selectedDocument.size));
      
      const filesChanged = idDocChanged || selectedDocChanged;
      const changed = formDataChanged || filesChanged;
      
      setHasChanges(changed);
    } else {
      setHasChanges(false);
    }
  }, [formData, uploadedFiles, originalFormData, originalUploadedFiles, cameFromDocumentsView]);

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
    // Extract SessionId from the response
    let extractedSessionId = null;
    
    // Try to find SessionId in different possible locations
    if (data.SessionId) {
      extractedSessionId = data.SessionId;
    } else if (data.sessionId) {
      extractedSessionId = data.sessionId;
    } else if (data.session_id) {
      extractedSessionId = data.session_id;
    } else if (data.body && data.body.SessionId) {
      extractedSessionId = data.body.SessionId;
    } else if (data.body && data.body.sessionId) {
      extractedSessionId = data.body.sessionId;
    } else if (data.body && data.body.session_id) {
      extractedSessionId = data.body.session_id;
    }
    
    if (extractedSessionId) {
      setSessionId(extractedSessionId);
      
      // Call the callback function to notify parent component
      if (onSessionIdReceived) {
        onSessionIdReceived(extractedSessionId, data, formData, uploadedFiles);
      }
    } else {
      // Create a mock SessionId for testing if none is provided
      const mockSessionId = 'mock-session-' + Date.now();
      setSessionId(mockSessionId);
      
      // Call the callback function to notify parent component with mock SessionId
      if (onSessionIdReceived) {
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

  // Handle going back to DocumentsView
  const handleBackToDocumentsView = () => {
    const sessionIdToUse = currentSessionId || sessionId;
    
    if (onSessionIdReceived && sessionIdToUse) {
      // When going back from DocumentsView, we don't need webhookResponse
      // Just pass the sessionId and current form data
      onSessionIdReceived(sessionIdToUse, null, formData, uploadedFiles);
    } else {
      console.error('[PDFUploadForm] Cannot go back to DocumentsView: missing sessionId or callback');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced configuration validation with detailed logging
    if (!webhookConfig.defaultUrl) {
      showError('Webhook URL not configured. Please create a .env file with REACT_APP_WEBHOOK_URL=your-make-webhook-url');
      return;
    }
    
    if (!webhookConfig.defaultApiKey) {
      showError('API key not configured. Please create a .env file with REACT_APP_WEBHOOK_API_KEY=your-make-api-key');
      return;
    }
    
    if (!uploadedFiles.idDocument) {
      showError('Please upload the main ID document.');
      return;
    }
    
    if (!formData.mainIdRole) {
      showError('Please enter the role for the main ID document.');
      return;
    }
    
    if (!uploadedFiles.selectedDocument) {
      showError('Please upload a document for the selected type.');
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    setResult(null);
    
    try {
      await uploadFiles(webhookConfig.defaultUrl);
    } catch (error) {
      console.error('[ERROR] Upload error:', error);
      showError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Upload files to Google Cloud Storage and send metadata to webhook
  const uploadFiles = async (webhookUrl) => {
    // Generate a consistent session ID for this upload
    const uploadSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (!userEmail) {
      throw new Error('User email is required for Google Cloud Storage upload. Your account is logged in but no email address was found. Please contact support or try logging in with a different account.');
    }
    
    // Create documents array structure
    
    const documents = [];
    
    // Add main ID document
    documents.push({
      file: uploadedFiles.idDocument,
      role: formData.mainIdRole,
      type: 'mainId'
    });
    
    // Add additional ID documents
    const additionalIdsWithDocuments = formData.additionalIds.filter(id => id.idDocument);
    additionalIdsWithDocuments.forEach((additionalId, index) => {
      documents.push({
        file: additionalId.idDocument,
        role: additionalId.role,
        type: 'additionalId'
      });
    });
    
    // Add selected document
    documents.push({
      file: uploadedFiles.selectedDocument,
      role: '',
      type: formData.documentType
    });
    
    // Upload files to Google Cloud Storage
    setIsCloudStorageUploading(true);
    
    // Initialize variables that will be used outside the try block
    let documentsArray = [];
    let sessionFolderName = '';
    
    // Check if Google Cloud Storage configuration is available
    const hasCloudStorageConfig = process.env.REACT_APP_GCS_PROJECT_ID &&
                                 process.env.REACT_APP_GCS_BUCKET_NAME;
    
    if (!hasCloudStorageConfig) {
      console.warn('[STEP 8.5.2] Google Cloud Storage configuration missing, using fallback mode');
      console.warn('[STEP 8.5.2] Please create a .env.local file with the following variables:');
      console.warn('[STEP 8.5.2] REACT_APP_GCS_PROJECT_ID=famous-store-468216-p6');
      console.warn('[STEP 8.5.2] REACT_APP_GCS_BUCKET_NAME=pdf-upload-myapp');
      
      // Create fallback documents array without Google Cloud Storage
      documentsArray = documents.map((doc, index) => ({
        itemId: index,
        filename: doc.file.name,
        fileType: doc.file.type || 'application/pdf',
        docType: doc.type,
        role: doc.role,
        cloudStorageFileId: `fallback-${Date.now()}-${index}`,
        cloudStorageWebUrl: `https://example.com/fallback/${doc.file.name}`,
        cloudStorageDownloadUrl: `https://example.com/fallback/${doc.file.name}`,
        fileSize: doc.file.size,
        lastModified: new Date().toISOString()
      }));
      
      sessionFolderName = `fallback-session-${Date.now()}`;
    } else {
      try {
        // Create organized folder structure
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const baseFolderPath = `PDF-Uploads/${today}/${uploadSessionId}`;
        
        // Organize files by type
        const mainIdFiles = documents.filter(doc => doc.type === 'mainId');
        const additionalIdFiles = documents.filter(doc => doc.type === 'additionalId');
        const certificateFiles = documents.filter(doc => doc.type === 'incorporation' || doc.type === 'authorization' || doc.type === 'exemption');
        
        // Upload files to their respective folders
        const allResults = [];
        
        // Upload main ID files
        if (mainIdFiles.length > 0) {
          const mainIdResults = await cloudStorageService.uploadMultipleFiles(mainIdFiles, userEmail, `${baseFolderPath}/main-id`);
          allResults.push(...mainIdResults.uploadResults);
        }
        
        // Upload additional ID files
        if (additionalIdFiles.length > 0) {
          const additionalIdResults = await cloudStorageService.uploadMultipleFiles(additionalIdFiles, userEmail, `${baseFolderPath}/additional-ids`);
          allResults.push(...additionalIdResults.uploadResults);
        }
        
        // Upload certificate files
        if (certificateFiles.length > 0) {
          const certificateResults = await cloudStorageService.uploadMultipleFiles(certificateFiles, userEmail, `${baseFolderPath}/certificate`);
          allResults.push(...certificateResults.uploadResults);
        }
        
        // Create documents array with Google Cloud Storage URLs
        documentsArray = allResults.map((result, index) => ({
          itemId: result.originalIndex,
          filename: result.fileName,
          fileType: 'application/pdf',
          docType: result.type,
          role: result.role,
          cloudStorageFileId: result.fileId || result.fileName,
          cloudStorageReadUrl: result.url, // Read URL from server
          cloudStorageWriteUrl: result.writeUrl, // Write URL from server
          cloudStorageWebUrl: result.url, // For backward compatibility
          cloudStorageDownloadUrl: result.url, // For backward compatibility
          bucketId: process.env.REACT_APP_GCS_BUCKET_NAME || 'pdf-upload-myapp',
          projectId: process.env.REACT_APP_GCS_PROJECT_ID || 'famous-store-468216-p6',
          fileSize: result.size,
          lastModified: result.lastModified
        }));
        
        sessionFolderName = baseFolderPath;
      } catch (oneDriveError) {
        console.error('[ERROR] OneDrive upload failed:', oneDriveError);
        // Fallback to basic document structure
        documentsArray = documents.map((doc, index) => ({
          itemId: index,
          filename: doc.file.name,
          fileType: doc.file.type || 'application/pdf',
          docType: doc.type,
          role: doc.role,
          oneDriveFileId: `error-${Date.now()}-${index}`,
          oneDriveWebUrl: `https://example.com/error/${doc.file.name}`,
          oneDriveDownloadUrl: `https://example.com/error/${doc.file.name}`,
          fileSize: doc.file.size,
          lastModified: new Date().toISOString()
        }));
        
        sessionFolderName = `error-session-${Date.now()}`;
      }
    }
    
    // Create JSON payload for webhook
    
    // Prepare the JSON payload - send as array for Make.com iterator
    const webhookPayload = [
      {
        documents: documentsArray,
        documentType: formData.documentType,
        cert_type: formData.documentType, // Add cert_type field for Supabase
        timestamp: new Date().toISOString(),
        totalFiles: documentsArray.length,
        cloudStorageSessionFolder: sessionFolderName,
        bucketId: process.env.REACT_APP_GCS_BUCKET_NAME || 'pdf-upload-myapp',
        projectId: process.env.REACT_APP_GCS_PROJECT_ID || 'famous-store-468216-p6',
        userEmail: userEmail,
        apiKey: webhookConfig.defaultApiKey,
        key: webhookConfig.defaultApiKey
      }
    ];
    
    // Continue with webhook upload
    
    // Check if we have the required data for webhook upload
    if (!webhookPayload || !webhookPayload[0] || !documentsArray.length) {
              throw new Error('Failed to prepare data for webhook upload. Google Cloud Storage upload may have failed.');
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
    
          // Mark Google Cloud Storage upload as completed
      setIsCloudStorageUploading(false);
    
    try {
      // Validate API key before sending
      if (!webhookConfig.defaultApiKey) {
        throw new Error('API key is not configured. Please check your REACT_APP_WEBHOOK_API_KEY environment variable.');
      }
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhookConfig.timeout || 30000);
      
      // Try with headers first, if that fails, try without headers
      let response;
      
      try {
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
      } catch (error) {
        console.error('[STEP 11.2] First attempt failed with error:', error.message);
        try {
          response = await fetch(webhookConfig.defaultUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload),
            signal: controller.signal
          });
        } catch (secondError) {
          console.error('[STEP 11.2] Second attempt also failed:', secondError.message);
          throw new Error(`Webhook request failed: ${secondError.message}`);
        }
      }
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));
        
        // Parse the response from Make.com - it comes as an array with body as JSON string
        let parsedResponse = {};
        if (responseData && Array.isArray(responseData) && responseData.length > 0) {
          try {
            // Parse the body which contains the actual response data
            let bodyContent = responseData[0].body;
            
            // Try to fix common JSON syntax errors
            // Remove extra quotes at the end of lines
            bodyContent = bodyContent.replace(/"\s*"\s*\r?\n/g, '"\r\n');
            // Remove trailing quotes before closing brace
            bodyContent = bodyContent.replace(/"\s*"\s*}/g, '"}');
            // Remove trailing quotes before closing bracket
            bodyContent = bodyContent.replace(/"\s*"\s*]/g, '"]');
            
            parsedResponse = JSON.parse(bodyContent);
          } catch (parseError) {
            console.error('[STEP 12.2.1] Failed to parse response body:', parseError);
            console.error('[STEP 12.2.1.1] Raw body content:', responseData[0].body);
            console.error('[STEP 12.2.1.2] Parse error details:', parseError.message);
            
            // Try alternative parsing methods
            try {
              const bodyText = responseData[0].body;
              const sessionIdMatch = bodyText.match(/"SessionId":\s*"([^"]+)"/);
              if (sessionIdMatch) {
                const extractedSessionId = sessionIdMatch[1];
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
        
        if (!sessionId) {
          throw new Error('No SessionId received from webhook response. Cannot proceed without valid SessionId.');
        }
        
        // Show success message
        showSuccess('הקבצים הועלו בהצלחה!', {
          sessionId: sessionId,
          totalFiles: documentsArray.length,
          oneDriveSessionFolder: sessionFolderName,
          responseData: responseData,
          parsedResponse: parsedResponse
        });
        
        // Call the callback with session ID and data
        if (onSessionIdReceived) {
          onSessionIdReceived(sessionId, responseData, formData, uploadedFiles);
        }
        
        // Save form data for potential resend
        if (onFormDataSaved) {
          onFormDataSaved(formData, uploadedFiles);
        }
        
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
      setIsCloudStorageUploading(false);
      throw error;
    }
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
        return 'עוסק מורשה';
      case 'exemption':
        return 'עוסק פטור';
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
            <p>You must be logged in to upload files to Google Cloud Storage. Please use the login button in the header to authenticate.</p>
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
          <div className={`status-item ${hasCloudStorageConfig ? 'success' : 'error'}`}>
            <i className={`fas ${hasCloudStorageConfig ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
            <span>Google Cloud Storage Upload: {hasCloudStorageConfig ? 'Ready' : 'Configuration Missing'}</span>
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
              <li>Azure AD account without email</li>
              <li>Approved user account without email</li>
              <li>Authentication provider configuration issue</li>
            </ul>
            <p><strong>Current user status:</strong> {user ? 'User object exists but no email found' : 'No user logged in'}</p>
          </div>
        )}
        {!hasCloudStorageConfig && (
          <div className="config-help">
            <p><strong>Google Cloud Storage Configuration Missing:</strong></p>
            <p>To enable Google Cloud Storage uploads, you need to configure GCS credentials:</p>
            <ol>
              <li>Create a <code>.env.local</code> file in the project root</li>
              <li>Add the following Google Cloud Storage configuration:</li>
              <pre>
{`REACT_APP_GCS_PROJECT_ID=famous-store-468216-p6
REACT_APP_GCS_BUCKET_NAME=pdf-upload-myapp`}
              </pre>
              <li>Restart the development server</li>
            </ol>
            <p><strong>Note:</strong> The system will work in fallback mode without Google Cloud Storage configuration, but files won't be uploaded to Google Cloud Storage.</p>
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
                  <small className="form-help">מחובר כעת - נדרש להעלאת קבצים ל-Google Cloud Storage</small>
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
           {(() => {
             const shouldShowBackButton = cameFromDocumentsView && !hasChanges;
             
             return (
               <button 
                 type={shouldShowBackButton ? "button" : "submit"}
                 className="submit-btn" 
                 disabled={!isFormReady || isUploading || isCloudStorageUploading}
                 onClick={(e) => {
                   if (shouldShowBackButton) {
                     e.preventDefault();
                     handleBackToDocumentsView();
                   }
                 }}
               >
                {isCloudStorageUploading ? (
                  <>
                    <i className="fas fa-cloud-upload-alt fa-spin"></i>
                    מעלה ל-Google Cloud Storage...
                  </>
                ) : isUploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    שולח למעבד...
                  </>
                ) : shouldShowBackButton ? (
                  <>
                    <i className="fas fa-arrow-left"></i>
                    חזרה לעדכון פרטים
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    שלח מסמכים
                  </>
                )}
              </button>
            );
          })()}
        </div>
      </form>

      {/* Progress Bar */}
      {(isUploading || isCloudStorageUploading) && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {isCloudStorageUploading ? 'מעלה קבצים ל-Google Cloud Storage...' : 'שולח למעבד...'}
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