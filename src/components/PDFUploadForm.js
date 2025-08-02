import React, { useState, useRef } from 'react';
import './PDFUploadForm.css';

const PDFUploadForm = () => {
  const [webhookUrl, setWebhookUrl] = useState('https://hook.us2.make.com/6n9rpd2bmug4j7mx73c8bzm979rm9osm');
  const [apiKey, setApiKey] = useState('Kf7Z1u8vP9QmR3xA2tS4nY6bW5oL0eJ1gH9cD7pF4qM2rV8yX6zU5kN3aB1iC7');
  const [uploadedFiles, setUploadedFiles] = useState({
    pdf1: null,
    pdf2: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  
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
  const showError = (message, debugData = null) => {
    setResult({
      type: 'error',
      title: 'Upload Failed',
      message: message
    });
    if (debugData) {
      setDebugInfo(debugData);
    }
  };

  // Show success
  const showSuccess = (title, data = {}) => {
    setResult({
      type: 'success',
      title: title,
      message: data.message || 'Your PDF documents have been successfully uploaded to the webhook.'
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[STEP 5] Form submission started');
    
    if (!webhookUrl.trim()) {
      console.error('[ERROR] Webhook URL is empty');
      showError('Please enter a valid webhook URL.');
      return;
    }
    
    if (!apiKey.trim()) {
      console.error('[ERROR] API key is empty');
      showError('Please enter a valid API key.');
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
      webhookUrl: webhookUrl,
      apiKeyLength: apiKey.length,
      pdf1Name: uploadedFiles.pdf1.name,
      pdf2Name: uploadedFiles.pdf2.name
    });
    
    setIsUploading(true);
    setProgress(0);
    setResult(null);
    
    try {
      await uploadFiles(webhookUrl);
    } catch (error) {
      console.error('[ERROR] Upload error:', error);
      
      if (error.debugData) {
        showError(`Upload failed: ${error.error.message}`, error.debugData);
      } else {
        showError(`Upload failed: ${error.message}`);
      }
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
    
    // Debug: Log request details
    const debugData = {
      webhookUrl: webhookUrl,
      apiKey: apiKey.substring(0, 10) + '...',
      files: {
        pdf1: {
          name: uploadedFiles.pdf1.name,
          size: uploadedFiles.pdf1.size,
          type: uploadedFiles.pdf1.type
        },
        pdf2: {
          name: uploadedFiles.pdf2.name,
          size: uploadedFiles.pdf2.size,
          type: uploadedFiles.pdf2.type
        }
      },
      timestamp: new Date().toISOString(),
      formDataEntries: []
    };
    
    // Log FormData contents for debugging
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        debugData.formDataEntries.push({
          key: key,
          type: 'File',
          name: value.name,
          size: value.size
        });
      } else {
        debugData.formDataEntries.push({
          key: key,
          type: 'String',
          value: value
        });
      }
    }
    
    console.log('Debug: Request details:', debugData);
    
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
        url: webhookUrl,
        method: 'POST',
        apiKeyHeader: 'x-make-apikey',
        apiKeyLength: apiKey.length,
        formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
          key,
          type: value instanceof File ? 'File' : 'String',
          value: value instanceof File ? `${value.name} (${value.size} bytes)` : value
        }))
      });
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'x-make-apikey': apiKey
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
        const result = await response.json().catch(() => ({}));
        console.log('[STEP 12] Success response body:', result);
        console.log('[STEP 13] Upload completed successfully!');
        showSuccess('Files uploaded successfully!', result);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          console.log('[STEP 14] Auto-resetting form after 3 seconds');
          resetForm();
        }, 3000);
      } else {
        console.log('[STEP 12] Response indicates error (status not 200-299)');
        const errorText = await response.text().catch(() => 'No error details available');
        console.log('[STEP 12] Error response body:', errorText);
        
        const errorData = {
          ...debugData,
          responseStatus: response.status,
          responseStatusText: response.statusText,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          responseBody: errorText
        };
        
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
      
      const errorData = {
        ...debugData,
        errorMessage: error.message,
        errorStack: error.stack
      };
      
      console.log('[ERROR] Throwing error with debug data for UI display');
      throw { error, debugData: errorData };
    }
  };

  // Reset form
  const resetForm = () => {
    console.log('[RESET] Resetting form to default values');
    setWebhookUrl('https://hook.us2.make.com/6n9rpd2bmug4j7mx73c8bzm979rm9osm');
    setApiKey('Kf7Z1u8vP9QmR3xA2tS4nY6bW5oL0eJ1gH9cD7pF4qM2rV8yX6zU5kN3aB1iC7');
    setUploadedFiles({ pdf1: null, pdf2: null });
    setProgress(0);
    setResult(null);
    
    // Reset file inputs
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) {
        ref.current.value = '';
      }
    });
    console.log('[RESET] Form reset completed');
  };

  // Check if form is ready to submit
  const isFormReady = webhookUrl.trim() && apiKey.trim() && uploadedFiles.pdf1 && uploadedFiles.pdf2;

  return (
    <div className="pdf-upload-form">
      {/* Debug Mode Toggle */}
      <div className="debug-toggle">
        <label className="debug-label">
          <input 
            type="checkbox" 
            checked={debugMode} 
            onChange={(e) => setDebugMode(e.target.checked)}
          />
          <span>Debug Mode</span>
        </label>
      </div>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="webhookUrl" className="form-label">
            <i className="fas fa-link"></i>
            Make.com Webhook URL
          </label>
          <input 
            type="url" 
            id="webhookUrl" 
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="form-input"
            placeholder="https://hook.us2.make.com/your-webhook-url"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiKey" className="form-label">
            <i className="fas fa-key"></i>
            API Key
          </label>
          <input 
            type="text" 
            id="apiKey" 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="form-input"
            placeholder="Enter your API key"
            required
          />
        </div>

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
          
          {/* Debug Information */}
          {debugMode && debugInfo && result.type === 'error' && (
            <div className="debug-info">
              <h4>Debug Information:</h4>
              <details>
                <summary>Click to view debug details</summary>
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFUploadForm; 