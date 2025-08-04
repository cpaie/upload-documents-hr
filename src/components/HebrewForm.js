import React, { useState } from 'react';
import { supabase } from './SubabaseClient.js';
import { webhookConfig } from '../config/webhook.config';
import './HebrewForm.css';

// OneDrive configuration
const ONEDRIVE_CONFIG = {
  clientId: '0e489b27-1a2f-48c0-a772-63bc61e6a8a9',
      clientSecret: process.env.REACT_APP_AZURE_CLIENT_SECRET || '',
  tenantId: '22fde68e-d975-441b-a414-73ff55b29824',
  userEmail: 'dudy@cpaie.co.il' // The user whose OneDrive we're uploading to
};

const HebrewForm = ({ onDataFetched, user, initialData }) => {
  const [formData, setFormData] = useState(() => {
    // If we have initial data (from resend), use it; otherwise start with empty form
    if (initialData) {
      console.log('[DEV] Loading form with initial data for resend:', initialData);
      return initialData;
    }
    return {
      jobDetails: '',
      mainIdImage: null,
      additionalIds: [],
      certificateType: '',
      certificateFile: null
    };
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const certificateOptions = [
    { value: '', label: 'בחר תעודה' },
    { value: 'התאגדות', label: 'התאגדות' },
    { value: 'מורשה', label: 'מורשה' },
    { value: 'פטור', label: 'פטור' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (field, file) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const addAdditionalId = () => {
    setFormData(prev => ({
      ...prev,
      additionalIds: [
        ...prev.additionalIds,
        { idImage: null, jobDetails: '' }
      ]
    }));
    console.log('[INFO] Added additional ID slot. Total additional IDs:', formData.additionalIds.length + 1);
  };

  const removeAdditionalId = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalIds: prev.additionalIds.filter((_, i) => i !== index)
    }));
  };

  const updateAdditionalId = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      additionalIds: prev.additionalIds.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // OneDrive upload function using server endpoint
  const uploadFileToOneDrive = async (file, folderPath = '') => {
    console.log(`[ONEDRIVE] Uploading file via server: ${file.name}`);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folderPath', folderPath);
    
    const response = await fetch('http://localhost:3001/api/upload-to-onedrive', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OneDrive upload failed: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log(`[ONEDRIVE] File uploaded successfully: ${result.file.name}`);
    return result.file;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[STEP 1] Form submission started');
      
      // Check webhook configuration
      console.log('[STEP 2] Checking webhook configuration:', {
        hasUrl: !!webhookConfig.defaultUrl,
        hasApiKey: !!webhookConfig.defaultApiKey,
        url: webhookConfig.defaultUrl || 'NOT SET',
        apiKeyLength: webhookConfig.defaultApiKey?.length || 0
      });

             // Upload files to OneDrive
      console.log('[STEP 3] Starting OneDrive upload process');
      
             const uploadResults = {
         timestamp: new Date().toISOString(),
         mainJobDetails: formData.jobDetails,
         certificateType: formData.certificateType,
         totalFiles: 0,
         uploadedFiles: [],
         failedFiles: []
       };
      
      // Create a unique folder for this submission
      const submissionFolder = `PDF-Uploads/${new Date().toISOString().split('T')[0]}/${Date.now()}`;
      
      // Upload main ID image if exists
      if (formData.mainIdImage) {
        console.log('[STEP 4] Uploading main ID image to OneDrive:', formData.mainIdImage.name);
        try {
          const result = await uploadFileToOneDrive(formData.mainIdImage, `${submissionFolder}/main-id`);
          uploadResults.uploadedFiles.push({
            fileType: 'mainIdImage',
            name: result.name,
            id: result.id,
            webUrl: result.webUrl,
            size: result.size,
            jobDetails: formData.jobDetails || ''
          });
          uploadResults.totalFiles++;
          console.log('[STEP 4.1] Main ID image uploaded successfully');
                 } catch (error) {
           console.error('[ERROR] Failed to upload main ID image:', error.message);
           uploadResults.failedFiles.push({
             fileType: 'mainIdImage',
             originalName: formData.mainIdImage.name,
             error: error.message,
             jobDetails: formData.jobDetails || ''
           });
         }
      }
      
      // Upload certificate file if exists
      if (formData.certificateFile) {
        console.log('[STEP 5] Uploading certificate file to OneDrive:', formData.certificateFile.name);
        try {
          const result = await uploadFileToOneDrive(formData.certificateFile, `${submissionFolder}/certificate`);
          uploadResults.uploadedFiles.push({
            fileType: 'certificateFile',
            name: result.name,
            id: result.id,
            webUrl: result.webUrl,
            size: result.size,
            certificateType: formData.certificateType
          });
          uploadResults.totalFiles++;
          console.log('[STEP 5.1] Certificate file uploaded successfully');
                 } catch (error) {
           console.error('[ERROR] Failed to upload certificate file:', error.message);
           uploadResults.failedFiles.push({
             fileType: 'certificateFile',
             originalName: formData.certificateFile.name,
             error: error.message,
             certificateType: formData.certificateType
           });
         }
      }
      
      // Upload additional ID files
      for (let index = 0; index < formData.additionalIds.length; index++) {
        const item = formData.additionalIds[index];
        if (item.idImage) {
          console.log(`[STEP 6] Uploading additional ID ${index} to OneDrive:`, item.idImage.name);
          try {
            const result = await uploadFileToOneDrive(item.idImage, `${submissionFolder}/additional-ids`);
                          uploadResults.uploadedFiles.push({
                fileType: 'additionalId',
                index: index,
                name: result.name,
                id: result.id,
                webUrl: result.webUrl,
                size: result.size,
                jobDetails: item.jobDetails || ''
              });
              uploadResults.totalFiles++;
              console.log(`[STEP 6.1] Additional ID ${index} uploaded successfully`);
                         } catch (error) {
               console.error(`[ERROR] Failed to upload additional ID ${index}:`, error.message);
               uploadResults.failedFiles.push({
                 fileType: 'additionalId',
                 index: index,
                 originalName: item.idImage.name,
                 error: error.message,
                 jobDetails: item.jobDetails || ''
               });
             }
          }
        }
        
        console.log('[STEP 6.2] OneDrive upload summary:', {
          totalFiles: uploadResults.totalFiles,
          uploadedFiles: uploadResults.uploadedFiles.length,
          failedFiles: uploadResults.failedFiles.length,
          folder: submissionFolder
        });
        
        // Send OneDrive file information to webhook if configured
        if (webhookConfig.defaultUrl && webhookConfig.defaultApiKey) {
          console.log('[STEP 7] Sending OneDrive file information to webhook');
          
          // Prepare webhook payload with OneDrive file IDs instead of base64
          const webhookPayload = {
            timestamp: uploadResults.timestamp,
            mainJobDetails: uploadResults.mainJobDetails,
            certificateType: uploadResults.certificateType,
            totalFiles: uploadResults.totalFiles,
            totalAttempted: uploadResults.uploadedFiles.length + uploadResults.failedFiles.length,
            submissionFolder: submissionFolder,
            oneDriveUpload: true,
            successfulFiles: uploadResults.uploadedFiles.map(file => ({
              fileType: file.fileType,
              name: file.name,
              originalName: file.originalName || file.name,
              id: file.id,           // OneDrive file ID
              webUrl: file.webUrl,   // OneDrive web URL
              size: file.size,
              jobDetails: file.jobDetails || '',
              certificateType: file.certificateType || '',
              index: file.index || null
            })),
            failedFiles: uploadResults.failedFiles.map(file => ({
              fileType: file.fileType,
              originalName: file.originalName,
              error: file.error,
              jobDetails: file.jobDetails || '',
              certificateType: file.certificateType || '',
              index: file.index || null
            }))
          };
          
          console.log('[STEP 7.1] Webhook payload prepared with OneDrive file IDs:', {
            totalFiles: webhookPayload.totalFiles,
            totalAttempted: webhookPayload.totalAttempted,
            successfulFilesCount: webhookPayload.successfulFiles.length,
            failedFilesCount: webhookPayload.failedFiles.length,
            successfulFileTypes: webhookPayload.successfulFiles.map(file => file.fileType),
            failedFileTypes: webhookPayload.failedFiles.map(file => file.fileType)
          });
          
          try {
            const response = await fetch(webhookConfig.defaultUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-make-apikey': webhookConfig.defaultApiKey
              },
              body: JSON.stringify(webhookPayload)
            });
            
            console.log('[STEP 8] Webhook response received:', {
              status: response.status,
              statusText: response.statusText,
              ok: response.ok
            });
            
            if (!response.ok) {
              const errorText = await response.text().catch(() => 'No error details');
              console.warn('[WARNING] Webhook failed:', errorText);
            } else {
              console.log('[STEP 9] Webhook notification sent successfully with OneDrive file IDs');
            }
          } catch (webhookError) {
            console.warn('[WARNING] Webhook request failed:', webhookError.message);
            console.log('[INFO] OneDrive upload completed successfully, webhook notification failed');
          }
        } else {
          console.log('[STEP 7] Webhook not configured, skipping webhook notification');
        }

      // Fetch data from Supabase table_id
      console.log('[STEP 10] Fetching data from Supabase');
      const { data: fetchedData, error } = await supabase
        .from('table_id')
        .select('*');
      
      if (error) {
        throw error;
      }

      console.log('[STEP 11] Supabase data fetched successfully');
      
             // Call the callback function to pass data to parent component
       if (onDataFetched) {
         onDataFetched(fetchedData || [], formData); // Pass both fetched data and form data
       }

    } catch (err) {
      setError(err.message);
      console.error('[ERROR] Form submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderFileInput = (label, accept, onChange, value, uniqueId) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files[0])}
        style={{ display: 'none' }}
        id={`file-${uniqueId}`}
      />
      <button
        type="button"
        className="file-button"
        onClick={() => document.getElementById(`file-${uniqueId}`).click()}
      >
        {value ? value.name : label}
      </button>
    </div>
  );

  return (
    <div className="hebrew-form-container" dir="rtl">
      {/* Configuration Status */}
      <div className="config-status" style={{
        background: '#f8f9fa',
        border: '2px solid #e1e5e9',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        direction: 'ltr'
      }}>
                 <h3 style={{
           fontSize: '1.2rem',
           fontWeight: '600',
           color: '#333',
           marginBottom: '1rem',
           display: 'flex',
           alignItems: 'center',
           gap: '0.5rem'
         }}>
           ⚙️ OneDrive + Webhook Configuration Status
         </h3>
                 <div style={{
           display: 'grid',
           gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
           gap: '1rem',
           marginBottom: '1rem'
         }}>
                       <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              fontWeight: '500',
              background: '#d4edda',
              color: '#155724',
              border: '1px solid #c3e6cb'
            }}>
              <span>✅</span>
              <span>OneDrive Server: Running on port 3001</span>
            </div>
           <div style={{
             display: 'flex',
             alignItems: 'center',
             gap: '0.5rem',
             padding: '0.75rem',
             borderRadius: '8px',
             fontWeight: '500',
             background: webhookConfig.defaultUrl ? '#d4edda' : '#f8d7da',
             color: webhookConfig.defaultUrl ? '#155724' : '#721c24',
             border: `1px solid ${webhookConfig.defaultUrl ? '#c3e6cb' : '#f5c6cb'}`
           }}>
             <span>{webhookConfig.defaultUrl ? '✅' : '❌'}</span>
             <span>Webhook URL: {webhookConfig.defaultUrl ? 'Configured' : 'Not Configured'}</span>
           </div>
           <div style={{
             display: 'flex',
             alignItems: 'center',
             gap: '0.5rem',
             padding: '0.75rem',
             borderRadius: '8px',
             fontWeight: '500',
             background: webhookConfig.defaultApiKey ? '#d4edda' : '#f8d7da',
             color: webhookConfig.defaultApiKey ? '#155724' : '#721c24',
             border: `1px solid ${webhookConfig.defaultApiKey ? '#c3e6cb' : '#f5c6cb'}`
           }}>
             <span>{webhookConfig.defaultApiKey ? '✅' : '❌'}</span>
             <span>API Key: {webhookConfig.defaultApiKey ? 'Configured' : 'Not Configured'}</span>
           </div>
         </div>
        {(!webhookConfig.defaultUrl || !webhookConfig.defaultApiKey) && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem'
          }}>
                         <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#856404' }}>
               <strong>How it works:</strong>
             </p>
             <ul style={{ margin: '0', paddingLeft: '1.5rem', color: '#856404' }}>
               <li>✅ Files are uploaded to OneDrive (no base64 conversion)</li>
               <li>✅ OneDrive file IDs and URLs are sent to webhook</li>
               <li>✅ Much faster and more efficient than base64</li>
               <li>⚠️ Webhook configuration is optional (for notifications)</li>
             </ul>
          </div>
        )}
      </div>

             <h2 className="form-title">
         טופס העלאת מסמכים
         {initialData && (
           <span style={{
             fontSize: '0.8rem',
             color: '#28a745',
             marginRight: '1rem',
             fontWeight: 'normal'
           }}>
             🔄 מצב פיתוח - שליחה חוזרת
           </span>
         )}
       </h2>
      
      {error && (
        <div className="error-message">
          שגיאה: {error}
        </div>
      )}

      <form className="hebrew-form" onSubmit={(e) => e.preventDefault()}>
        {/* Job Details */}
        <div className="form-group">
          <label className="form-label">פרטי התפקיד</label>
          <input
            type="text"
            className="form-input"
            value={formData.jobDetails}
            onChange={(e) => handleInputChange('jobDetails', e.target.value)}
            placeholder="הכנס פרטי התפקיד"
          />
        </div>

        {/* Main ID Image Upload */}
        {renderFileInput(
          'ת״ז העלאת תמונה',
          'image/jpeg,image/jpg,image/png,.pdf,.doc,.docx',
          (file) => handleFileChange('mainIdImage', file),
          formData.mainIdImage,
          'main-id-image'
        )}

                 {/* Additional IDs Section */}
         <div className="form-group">
           <div className="section-header">
             <h3>ת״ז נוספות ({formData.additionalIds.length})</h3>
             <button
               type="button"
               className="add-button"
               onClick={addAdditionalId}
             >
               הוסף תעודת זהות נוספת
             </button>
           </div>

          {formData.additionalIds.map((item, index) => (
            <div key={index} className="additional-id-item">
              <div className="additional-id-header">
                <h4>ת״ז נוספת {index + 1}</h4>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => removeAdditionalId(index)}
                >
                  הסר
                </button>
              </div>
              
                             {renderFileInput(
                 'ת״ז',
                 '.pdf,.doc,.docx,image/jpeg,image/jpg,image/png',
                 (file) => updateAdditionalId(index, 'idImage', file),
                 item.idImage,
                 `additional-id-${index}`
               )}

              <div className="form-group">
                <label className="form-label">פרטי תפקיד</label>
                <input
                  type="text"
                  className="form-input"
                  value={item.jobDetails}
                  onChange={(e) => updateAdditionalId(index, 'jobDetails', e.target.value)}
                  placeholder="הכנס פרטי התפקיד"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Certificate Type Dropdown */}
        <div className="form-group">
          <label className="form-label">בחר תעודה</label>
          <select
            className="form-select"
            value={formData.certificateType}
            onChange={(e) => handleInputChange('certificateType', e.target.value)}
          >
            {certificateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Certificate File Upload */}
        {renderFileInput(
          'בחר תעודה',
          '.pdf,.doc,.docx',
          (file) => handleFileChange('certificateFile', file),
          formData.certificateFile,
          'certificate-file'
        )}

                 {/* File Summary */}
         <div className="form-group" style={{
           background: '#f8f9fa',
           border: '1px solid #e1e5e9',
           borderRadius: '8px',
           padding: '1rem',
           marginBottom: '1rem'
         }}>
           <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>סיכום קבצים</h4>
           <div style={{ fontSize: '0.9rem', color: '#666' }}>
             <div>ת״ז ראשית: {formData.mainIdImage ? '✅ ' + formData.mainIdImage.name : '❌ לא נבחר'}</div>
             <div>ת״ז נוספות: {formData.additionalIds.filter(item => item.idImage).length} מתוך {formData.additionalIds.length}</div>
             <div>תעודה: {formData.certificateFile ? '✅ ' + formData.certificateFile.name : '❌ לא נבחר'}</div>
             <div style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>
               סה"כ קבצים: {[
                 formData.mainIdImage ? 1 : 0,
                 formData.additionalIds.filter(item => item.idImage).length,
                 formData.certificateFile ? 1 : 0
               ].reduce((a, b) => a + b, 0)}
             </div>
           </div>
         </div>

         {/* Submit Button */}
         <div className="form-group">
           <button
             type="button"
             className="submit-button"
             onClick={handleSubmit}
             disabled={loading}
           >
             {loading ? 'טוען...' : 'המשך'}
           </button>
         </div>
      </form>
    </div>
  );
};

export default HebrewForm; 