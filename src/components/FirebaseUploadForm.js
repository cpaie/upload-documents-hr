import React, { useState, useRef, useEffect } from 'react';
import { uploadMultipleFiles, getUploads, deleteFile } from '../services/firebaseService';
import { storageConfig } from '../config/firebase.config';
import './PDFUploadForm.css';

const FirebaseUploadForm = () => {
  const [uploadedFiles, setUploadedFiles] = useState({
    pdf1: null,
    pdf2: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(false);
  
  const fileInputRefs = {
    pdf1: useRef(null),
    pdf2: useRef(null)
  };

  // Load existing uploads on component mount
  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    setLoadingUploads(true);
    try {
      const uploadsData = await getUploads();
      setUploads(uploadsData);
    } catch (error) {
      console.error('Error loading uploads:', error);
      showError('Failed to load existing uploads');
    } finally {
      setLoadingUploads(false);
    }
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
    
    if (file.size > storageConfig.maxFileSize) { // Configurable file size limit
      console.error(`[ERROR] File too large for PDF${fileIndex}:`, file.size, 'bytes');
      showError(`File size must be less than ${storageConfig.maxFileSize / (1024 * 1024)}MB.`);
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
      message: data.message || 'Your PDF documents have been successfully uploaded to Firebase.'
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[STEP 5] Form submission started');
    
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
      pdf1Name: uploadedFiles.pdf1.name,
      pdf2Name: uploadedFiles.pdf2.name
    });
    
    setIsUploading(true);
    setProgress(0);
    setResult(null);
    
    try {
      const files = [uploadedFiles.pdf1, uploadedFiles.pdf2];
      const additionalData = {
        uploadType: 'dual-pdf',
        timestamp: new Date().toISOString()
      };
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + 10;
          }
          return prev;
        });
      }, 200);
      
      const uploadResults = await uploadMultipleFiles(files, additionalData);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('[STEP 13] Upload completed successfully!', uploadResults);
      showSuccess('Files uploaded successfully!', {
        message: `Successfully uploaded ${uploadResults.length} files to Firebase.`
      });
      
      // Reload uploads list
      await loadUploads();
      
      // Reset form after 3 seconds
      setTimeout(() => {
        console.log('[STEP 14] Auto-resetting form after 3 seconds');
        resetForm();
      }, 3000);
      
    } catch (error) {
      console.error('[ERROR] Upload error:', error);
      showError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    console.log('[RESET] Resetting form to default values');
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

  // Handle file deletion
  const handleDeleteFile = async (fileName, docId) => {
    try {
      await deleteFile(fileName, docId);
      await loadUploads(); // Reload the list
      showSuccess('File deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error);
      showError('Failed to delete file');
    }
  };

  // Check if form is ready to submit
  const isFormReady = uploadedFiles.pdf1 && uploadedFiles.pdf2;

  return (
    <div className="pdf-upload-form">
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="upload-section">
          <h2 className="section-title">Upload PDF Documents to Firebase</h2>
          
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
                      style={{ display: 'none' }}
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
                Uploading to Firebase...
              </>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt"></i>
                Upload to Firebase
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
          <p className="progress-text">Uploading files to Firebase...</p>
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

      {/* Uploads History */}
      <div className="uploads-history">
        <h3 className="section-title">Recent Uploads</h3>
        {loadingUploads ? (
          <div className="loading">Loading uploads...</div>
        ) : uploads.length > 0 ? (
          <div className="uploads-list">
            {uploads.map((upload) => (
              <div key={upload.id} className="upload-item">
                <div className="upload-info">
                  <i className="fas fa-file-pdf"></i>
                  <div className="upload-details">
                    <span className="upload-name">{upload.fileName}</span>
                    <span className="upload-size">{formatFileSize(upload.size)}</span>
                    <span className="upload-date">
                      {new Date(upload.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="upload-actions">
                  <a 
                    href={upload.downloadURL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="download-btn"
                  >
                    <i className="fas fa-download"></i>
                  </a>
                  <button 
                    onClick={() => handleDeleteFile(upload.fileName, upload.id)}
                    className="delete-btn"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-uploads">No uploads yet. Upload your first files!</p>
        )}
      </div>
    </div>
  );
};

export default FirebaseUploadForm; 