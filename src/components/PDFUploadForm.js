import React, { useState, useRef } from 'react';
import { webhookConfig } from '../config/webhook.config';
import './PDFUploadForm.css';

const PDFUploadForm = () => {
  const [uploadedFiles, setUploadedFiles] = useState({
    pdf1: null,
    pdf2: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [webhookResponse, setWebhookResponse] = useState(null);
  
  const fileInputRefs = {
    pdf1: useRef(null),
    pdf2: useRef(null)
  };

  // Handle file selection
  const handleFileSelect = (event, fileIndex) => {
    const file = event.target.files[0];
    console.log(`[STEP 1] File selected for PDF${fileIndex}:`, {
      name: file?.name,
      size: file?.size,
      type: file?.type
    });
    if (file) {
      handleFileUpload(file, fileIndex);
    }
  };

  // Handle file upload
  const handleFileUpload = (file, fileIndex) => {
    console.log(`[STEP 2] Processing file for PDF${fileIndex}:`, {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    if (file.type !== 'application/pdf') {
      console.error(`[ERROR] Invalid file type for PDF${fileIndex}:`, file.type);
      showError('Please select a valid PDF file.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      console.error(`[ERROR] File too large for PDF${fileIndex}:`, file.size, 'bytes');
      showError('File size must be less than 10MB.');
      return;
    }
    
    console.log(`[STEP 3] File validation passed for PDF${fileIndex}:`, {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    setUploadedFiles(prev => ({
      ...prev,
      [`pdf${fileIndex}`]: file
    }));
    
    console.log(`[STEP 4] File added to state for PDF${fileIndex}:`, file.name);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, fileIndex) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        handleFileUpload(file, fileIndex);
      } else {
        showError('Please select a valid PDF file.');
      }
    }
  };

  // Remove file
  const removeFile = (fileIndex) => {
    setUploadedFiles(prev => ({
      ...prev,
      [`pdf${fileIndex}`]: null
    }));
    if (fileInputRefs[`pdf${fileIndex}`].current) {
      fileInputRefs[`pdf${fileIndex}`].current.value = '';
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
    setResult({
      type: 'success',
      title: title,
      message: data.message || 'Your PDF documents have been successfully uploaded to the webhook.'
    });
    setWebhookResponse(data);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[STEP 5] Form submission started');
    
    if (!webhookConfig.defaultUrl) {
      console.error('[ERROR] Webhook URL not configured');
      showError('Webhook URL not configured. Please check your environment variables.');
      return;
    }
    
    if (!webhookConfig.defaultApiKey) {
      console.error('[ERROR] API key not configured');
      showError('API key not configured. Please check your environment variables.');
      return;
    }
    
    if (!uploadedFiles.pdf1 || !uploadedFiles.pdf2) {
      console.error('[ERROR] Missing PDF files:', {
        pdf1: !!uploadedFiles.pdf1,
        pdf2: !!uploadedFiles.pdf2
      });
      showError('Please select both PDF files.');
      return;
    }
    
    console.log('[STEP 6] Form validation passed, starting upload process');
    console.log('[STEP 6] Upload details:', {
      webhookUrl: webhookConfig.defaultUrl,
      apiKeyLength: webhookConfig.defaultApiKey?.length || 0,
      pdf1Name: uploadedFiles.pdf1.name,
      pdf2Name: uploadedFiles.pdf2.name
    });
    
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

  // Upload files to webhook
  const uploadFiles = async (webhookUrl) => {
    console.log('[STEP 7] Starting file upload process');
    
    const formData = new FormData();
    
    // Add files to form data
    console.log('[STEP 8] Adding files to FormData');
    formData.append('pdf1', uploadedFiles.pdf1);
    formData.append('pdf2', uploadedFiles.pdf2);
    console.log('[STEP 8] Files added to FormData:', {
      pdf1: uploadedFiles.pdf1.name,
      pdf2: uploadedFiles.pdf2.name
    });
    
    // Add metadata
    console.log('[STEP 9] Adding metadata to FormData');
    formData.append('timestamp', new Date().toISOString());
    formData.append('totalFiles', '2');
    console.log('[STEP 9] Metadata added:', {
      timestamp: new Date().toISOString(),
      totalFiles: '2'
    });
    
    console.log('Upload request details:', {
      webhookUrl: webhookConfig.defaultUrl,
      files: {
        pdf1: uploadedFiles.pdf1.name,
        pdf2: uploadedFiles.pdf2.name
      }
    });
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) {
          return prev + 10;
        }
        return prev;
      });
    }, 200);
    
    try {
      console.log('[STEP 10] About to send HTTP request');
      console.log('[STEP 10] Request details:', {
        url: webhookConfig.defaultUrl,
        method: 'POST',
        apiKeyHeader: 'x-make-apikey',
        apiKeyLength: webhookConfig.defaultApiKey?.length || 0,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: value instanceof File ? 'File' : 'String',
          value: value instanceof File ? `${value.name} (${value.size} bytes)` : value
        }))
      });
      
      const response = await fetch(webhookConfig.defaultUrl, {
        method: 'POST',
        headers: {
          'x-make-apikey': webhookConfig.defaultApiKey
        },
        body: formData
      });
      
      console.log('[STEP 11] HTTP request sent successfully');
      console.log('[STEP 11] Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (response.ok) {
        console.log('[STEP 12] Response is successful (status 200-299)');
        const responseData = await response.json().catch(() => ({}));
        console.log('[STEP 12] Success response body:', responseData);
        console.log('[STEP 13] Upload completed successfully!');
        showSuccess('Files uploaded successfully!', {
          ...responseData,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Reset form after 3 seconds
        setTimeout(() => {
          console.log('[STEP 14] Auto-resetting form after 1 hour');
          resetForm();
        }, 3600000);
      } else {
        console.log('[STEP 12] Response indicates error (status not 200-299)');
        const errorText = await response.text().catch(() => 'No error details available');
        console.log('[STEP 12] Error response body:', errorText);
        
        console.log('[STEP 13] Upload failed with HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('[ERROR] Upload failed with exception:', error);
      throw error;
    }
  };

  // Reset form
  const resetForm = () => {
    console.log('[RESET] Resetting form to default values');
    setUploadedFiles({ pdf1: null, pdf2: null });
    setProgress(0);
    setResult(null);
    setWebhookResponse(null);
    
    // Reset file inputs
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) {
        ref.current.value = '';
      }
    });
    console.log('[RESET] Form reset completed');
  };

  // Check if form is ready to submit
  const isFormReady = webhookConfig.defaultUrl && webhookConfig.defaultApiKey && uploadedFiles.pdf1 && uploadedFiles.pdf2;

  return (
    <div className="pdf-upload-form">
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="upload-section">
          <h2 className="section-title">Upload PDF Documents</h2>
          
          <div className="upload-grid">
            {[1, 2].map((index) => (
              <div 
                key={index}
                className="upload-card" 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                {!uploadedFiles[`pdf${index}`] ? (
                  <div 
                    className="upload-area"
                    onClick={() => fileInputRefs[`pdf${index}`].current?.click()}
                  >
                    <i className="fas fa-cloud-upload-alt upload-icon"></i>
                    <h3>Document {index}</h3>
                    <p>Click or drag to upload PDF</p>
                    <input 
                      type="file" 
                      ref={fileInputRefs[`pdf${index}`]}
                      accept=".pdf" 
                      style={{ display: 'none' }}          // ⟵ חדש: מסתיר את ה־input 
                      className="file-input"
                      onChange={(e) => handleFileSelect(e, index)}
                      required
                    />
                  </div>
                ) : (
                  <div className="file-info">
                    <div className="file-details">
                      <i className="fas fa-file-pdf file-icon"></i>
                      <div className="file-text">
                        <span className="file-name">{uploadedFiles[`pdf${index}`].name}</span>
                        <span className="file-size">{formatFileSize(uploadedFiles[`pdf${index}`].size)}</span>
                      </div>
                      <button 
                        type="button" 
                        className="remove-btn" 
                        onClick={() => removeFile(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={!isFormReady || isUploading}
          >
            {isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Uploading...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Upload Documents
              </>
            )}
          </button>
        </div>
      </form>

      {/* Progress Bar */}
      {isUploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="progress-text">Uploading files...</p>
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
            Webhook Response
          </h3>
          
          <div className="response-details">
            <div className="response-section">
              <h4>Status</h4>
              <div className="status-info">
                <span className={`status-badge ${webhookResponse.status >= 200 && webhookResponse.status < 300 ? 'success' : 'error'}`}>
                  {webhookResponse.status} {webhookResponse.statusText}
                </span>
              </div>
            </div>

            {webhookResponse.headers && Object.keys(webhookResponse.headers).length > 0 && (
              <div className="response-section">
                <h4>Response Headers</h4>
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
                <h4>Response Data</h4>
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