import React, { useState, useEffect, useCallback } from 'react';
import { documentsService } from '../services/documentsService';
import { supabase } from './SubabaseClient.js';
import './DocumentsView.css';

// Test log to verify file is loaded
console.log('[DocumentsView] FIXED FILE loaded successfully with officeAdr support');

const DocumentsView = ({ sessionId, onBackToUpload, onDataApproved }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [summary, setSummary] = useState(null);
  const [isEditing] = useState(true); // Start in edit mode
  const [editableDocuments, setEditableDocuments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    console.log('[DocumentsView] Fetching documents for SessionId:', sessionId);
    setLoading(true);
    setError(null);
    
    try {
      const data = await documentsService.fetchDocumentsBySessionId(sessionId);
      console.log('[DocumentsView] Documents received:', data);
      
      const documentsData = data.documents || data || [];
      setDocuments(documentsData);
      setSummary(data.summary);
      
      // Initialize editable documents when data is loaded
      setEditableDocuments(documentsData.map(doc => ({ ...doc })));
    } catch (err) {
      console.error('[DocumentsView] Error fetching documents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleRefresh = () => {
    console.log('[DocumentsView] Refreshing documents');
    setRefreshCount(prev => prev + 1);
  };

  const handleCancelEdit = () => {
    // Reset to original documents but stay in edit mode
    setEditableDocuments(documents.map(doc => ({ ...doc })));
    setSaveError(null);
  };

  const handleExtractedDataEdit = (documentId, key, value) => {
    setEditableDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              extractedData: { 
                ...doc.extractedData, 
                [key]: value 
              } 
            }
          : doc
      )
    );
  };

  const handleSaveToSupabase = async () => {
    setSaving(true);
    setSaveError(null);
    
    try {
      console.log('[DocumentsView] Saving documents to Supabase with SessionId:', sessionId);
      
      // Save each document to the appropriate table based on type
      for (const doc of editableDocuments) {
        const extractedData = doc.extractedData || {};
        
        if (doc.type === 'ID Document' || doc.type === 'mainId' || doc.type === 'additionalId') {
          console.log('[DocumentsView] Saving ID document data:', {
            SessionId: sessionId,
            FirstName: extractedData.FirstName,
            LastName: extractedData.LastName,
            DateOfBirth: extractedData.DateOfBirth,
            IdNumber: extractedData.IdNumber,
            IssuedDate: extractedData.IssuedDate,
            ValidUntil: extractedData.ValidUntil,
            IdType: extractedData.IdType,
            Role: extractedData.Role
          });

          // First check if record exists
          const { data: existingRecord } = await supabase
            .from('table_id')
            .select('*')
            .eq('SessionId', sessionId)
            .single();

          if (existingRecord) {
            // Update existing record
            const { error } = await supabase
              .from('table_id')
              .update({
                FirstName: extractedData.FirstName || '',
                LastName: extractedData.LastName || '',
                DateOfBirth: extractedData.DateOfBirth || null,
                IdNumber: extractedData.IdNumber || '',
                IssuedDate: extractedData.IssuedDate || null,
                ValidUntil: extractedData.ValidUntil || null,
                IdType: extractedData.IdType || '',
                Role: extractedData.Role || ''
              })
              .eq('SessionId', sessionId);

            if (error) {
              console.error('[DocumentsView] Error updating ID record:', error);
              throw error;
            }
            console.log('[DocumentsView] Updated existing ID record');
          } else {
            // Insert new record
            const { error } = await supabase
              .from('table_id')
              .insert({
                SessionId: sessionId,
                FirstName: extractedData.FirstName || '',
                LastName: extractedData.LastName || '',
                DateOfBirth: extractedData.DateOfBirth || null,
                IdNumber: extractedData.IdNumber || '',
                IssuedDate: extractedData.IssuedDate || null,
                ValidUntil: extractedData.ValidUntil || null,
                IdType: extractedData.IdType || '',
                Role: extractedData.Role || ''
              });

            if (error) {
              console.error('[DocumentsView] Error inserting ID record:', error);
              throw error;
            }
            console.log('[DocumentsView] Inserted new ID record');
          }
        } else if (doc.type === 'Certificate Document' || doc.type === 'incorporation' || doc.type === 'authorization' || doc.type === 'exemption' || doc.type === 'Company Certificate' || doc.type === 'certificate') {
          console.log('[DocumentsView] Saving certificate document data:', {
            SessionId: sessionId,
            CompanyNameHeb: extractedData.CompanyNameHeb,
            BusinessId: extractedData.BusinessId,
            IssuedDate: extractedData.IssuedDate,
            officeAdr: extractedData.officeAdr,
            mailAdr: extractedData.mailAdr
          });

          // First check if record exists
          const { data: existingRecord } = await supabase
            .from('HR_cert_id')
            .select('*')
            .eq('SessionId', sessionId)
            .single();

          if (existingRecord) {
            // Update existing record
            const { error } = await supabase
              .from('HR_cert_id')
              .update({
                CompanyNameHeb: extractedData.CompanyNameHeb || '',
                BusinessId: extractedData.BusinessId || '',
                IssuedDate: extractedData.IssuedDate || null,
                officeAdr: extractedData.officeAdr || '',
                mailAdr: extractedData.mailAdr || ''
              })
              .eq('SessionId', sessionId);

            if (error) {
              console.error('[DocumentsView] Error updating certificate record:', error?.message || error, error?.details || '', error);
              throw error;
            }
            console.log('[DocumentsView] Updated existing certificate record');
          } else {
            // Insert new record
            const { error } = await supabase
              .from('HR_cert_id')
              .insert({
                SessionId: sessionId,
                CompanyNameHeb: extractedData.CompanyNameHeb || '',
                BusinessId: extractedData.BusinessId || '',
                IssuedDate: extractedData.IssuedDate || null,
                officeAdr: extractedData.officeAdr || '',
                mailAdr: extractedData.mailAdr || ''
              });

            if (error) {
              console.error('[DocumentsView] Error inserting certificate record:', error?.message || error, error?.details || '', error);
              throw error;
            }
            console.log('[DocumentsView] Inserted new certificate record');
          }
        }
      }
      
      console.log('[DocumentsView] Successfully saved all documents in Supabase');
      setSaving(false);
    } catch (err) {
      console.error('[DocumentsView] Error saving to Supabase:', err?.message || err, err?.details || '', err);
      if (err) {
        console.error('[DocumentsView] Supabase error details (stringified):', JSON.stringify(err, null, 2));
      }
      setSaving(false);
    }
  };

  const handleApproveData = async () => {
    console.log('[DocumentsView] Approving data and updating all documents to Supabase');
    
    try {
      // Update each document for approval
      for (const document of editableDocuments) {
        console.log('[DocumentsView] Updating document for approval:', document.id);
        const extractedData = document.extractedData || {};
        
        if (document.type === 'ID Document' || document.type === 'mainId' || document.type === 'additionalId') {
          console.log('[DocumentsView] Updating ID document for approval:', document.id, 'Type:', typeof document.id);
          
          // First check if record exists
          const { data: existingRecord } = await supabase
            .from('table_id')
            .select('*')
            .eq('SessionId', sessionId)
            .single();

          if (existingRecord) {
            // Update existing record
            const { error } = await supabase
              .from('table_id')
              .update({
                FirstName: extractedData.FirstName || '',
                LastName: extractedData.LastName || '',
                DateOfBirth: extractedData.DateOfBirth || null,
                IdNumber: extractedData.IdNumber || '',
                IssuedDate: extractedData.IssuedDate || null,
                ValidUntil: extractedData.ValidUntil || null,
                IdType: extractedData.IdType || '',
                Role: extractedData.Role || ''
              })
              .eq('SessionId', sessionId);

            if (error) {
              console.error('[DocumentsView] Error updating ID document:', error);
              throw error;
            }
            console.log('[DocumentsView] Updated existing ID record for approval using ID:', document.id);
          } else {
            // Insert new record
            const { error } = await supabase
              .from('table_id')
              .insert({
                SessionId: sessionId,
                FirstName: extractedData.FirstName || '',
                LastName: extractedData.LastName || '',
                DateOfBirth: extractedData.DateOfBirth || null,
                IdNumber: extractedData.IdNumber || '',
                IssuedDate: extractedData.IssuedDate || null,
                ValidUntil: extractedData.ValidUntil || null,
                IdType: extractedData.IdType || '',
                Role: extractedData.Role || ''
              });

            if (error) {
              console.error('[DocumentsView] Error inserting ID document:', error);
              throw error;
            }
            console.log('[DocumentsView] Inserted new ID record for approval');
          }
        } else if (document.type === 'Certificate Document' || document.type === 'incorporation' || document.type === 'authorization' || document.type === 'exemption' || document.type === 'Company Certificate' || document.type === 'certificate') {
          console.log('[DocumentsView] Updating certificate document for approval:', document.id);
          
          // First check if record exists
          const { data: existingRecord } = await supabase
            .from('HR_cert_id')
            .select('*')
            .eq('SessionId', sessionId)
            .single();

          if (existingRecord) {
            // Update existing record
            const { error } = await supabase
              .from('HR_cert_id')
              .update({
                CompanyNameHeb: extractedData.CompanyNameHeb || '',
                BusinessId: extractedData.BusinessId || '',
                IssuedDate: extractedData.IssuedDate || null,
                officeAdr: extractedData.officeAdr || '',
                mailAdr: extractedData.mailAdr || ''
              })
              .eq('SessionId', sessionId);

            if (error) {
              console.error('[DocumentsView] Error updating certificate document:', error);
              throw error;
            }
            console.log('[DocumentsView] Updated existing certificate record for approval using ID:', document.id);
          } else {
            // Insert new record
            const { error } = await supabase
              .from('HR_cert_id')
              .insert({
                SessionId: sessionId,
                CompanyNameHeb: extractedData.CompanyNameHeb || '',
                BusinessId: extractedData.BusinessId || '',
                IssuedDate: extractedData.IssuedDate || null,
                officeAdr: extractedData.officeAdr || '',
                mailAdr: extractedData.mailAdr || ''
              });

            if (error) {
              console.error('[DocumentsView] Error inserting certificate document:', error?.message || error, error?.details || '', error);
              throw error;
            }
            console.log('[DocumentsView] Inserted new certificate record for approval');
          }
        }
      }
      
      console.log('[DocumentsView] All documents updated successfully for approval');
      
      // Call the callback to notify parent component
      if (onDataApproved) {
        onDataApproved();
      }
    } catch (error) {
      console.error('[DocumentsView] Error updating documents for approval:', error?.message || error, error?.details || '', error);
      setSaveError(error.message);
    }
  };

  const handleUpdateSingleDocument = async (document) => {
    console.log('[DocumentsView] Updating single document:', document);
    
    try {
      const extractedData = document.extractedData || {};
      
      if (document.type === 'ID Document' || document.type === 'mainId' || document.type === 'additionalId') {
        console.log('[DocumentsView] Updating ID document:', document.id, 'Type:', typeof document.id);
        
        // First check if record exists
        const { data: existingRecord } = await supabase
          .from('table_id')
          .select('*')
          .eq('SessionId', sessionId)
          .single();

        if (existingRecord) {
          // Update existing record
          const { error } = await supabase
            .from('table_id')
            .update({
              FirstName: extractedData.FirstName || '',
              LastName: extractedData.LastName || '',
              DateOfBirth: extractedData.DateOfBirth || null,
              IdNumber: extractedData.IdNumber || '',
              IssuedDate: extractedData.IssuedDate || null,
              ValidUntil: extractedData.ValidUntil || null,
              IdType: extractedData.IdType || '',
              Role: extractedData.Role || ''
            })
            .eq('SessionId', sessionId);

          if (error) {
            console.error('[DocumentsView] Error updating ID document:', error);
            if (error) {
              console.error('[DocumentsView] Supabase error details (stringified):', JSON.stringify(error, null, 2));
            }
            throw error;
          }
          console.log('[DocumentsView] Updated existing ID record using ID:', document.id);
        } else {
          // Insert new record
          const { error } = await supabase
            .from('table_id')
            .insert({
              SessionId: sessionId,
              FirstName: extractedData.FirstName || '',
              LastName: extractedData.LastName || '',
              DateOfBirth: extractedData.DateOfBirth || null,
              IdNumber: extractedData.IdNumber || '',
              IssuedDate: extractedData.IssuedDate || null,
              ValidUntil: extractedData.ValidUntil || null,
              IdType: extractedData.IdType || '',
              Role: extractedData.Role || ''
            });

          if (error) {
            console.error('[DocumentsView] Error inserting ID document:', error);
            if (error) {
              console.error('[DocumentsView] Supabase error details (stringified):', JSON.stringify(error, null, 2));
            }
            throw error;
          }
          console.log('[DocumentsView] Inserted new ID record');
        }
      } else if (document.type === 'Certificate Document' || document.type === 'incorporation' || document.type === 'authorization' || document.type === 'exemption' || document.type === 'Company Certificate' || document.type === 'certificate') {
        console.log('[DocumentsView] Updating certificate document:', document.id);
        
        // First check if record exists
        const { data: existingRecord } = await supabase
          .from('HR_cert_id')
          .select('*')
          .eq('SessionId', sessionId)
          .single();

        if (existingRecord) {
          // Update existing record
          const { error } = await supabase
            .from('HR_cert_id')
            .update({
              CompanyNameHeb: extractedData.CompanyNameHeb || '',
              BusinessId: extractedData.BusinessId || '',
              IssuedDate: extractedData.IssuedDate || null,
              officeAdr: extractedData.officeAdr || '',
              mailAdr: extractedData.mailAdr || ''
            })
            .eq('SessionId', sessionId);

          if (error) {
            console.error('[DocumentsView] Error updating certificate document:', error);
            if (error) {
              console.error('[DocumentsView] Supabase error details (stringified):', JSON.stringify(error, null, 2));
            }
            throw error;
          }
          console.log('[DocumentsView] Updated existing certificate record using ID:', document.id);
        } else {
          // Insert new record
          const { error } = await supabase
            .from('HR_cert_id')
            .insert({
              SessionId: sessionId,
              CompanyNameHeb: extractedData.CompanyNameHeb || '',
              BusinessId: extractedData.BusinessId || '',
              IssuedDate: extractedData.IssuedDate || null,
              officeAdr: extractedData.officeAdr || '',
              mailAdr: extractedData.mailAdr || ''
            });

          if (error) {
            console.error('[DocumentsView] Error inserting certificate document:', error);
            if (error) {
              console.error('[DocumentsView] Supabase error details (stringified):', JSON.stringify(error, null, 2));
            }
            throw error;
          }
          console.log('[DocumentsView] Inserted new certificate record');
        }
      }
    } catch (error) {
      console.error('[DocumentsView] Error updating single document:', error?.message || error, error?.details || '', error);
      if (error) {
        console.error('[DocumentsView] Supabase error details (stringified):', JSON.stringify(error, null, 2));
      }
      setSaveError(error.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('he-IL');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'processed':
        return 'status-processed';
      case 'processing':
        return 'status-processing';
      case 'error':
        return 'status-error';
      default:
        return 'status-unknown';
    }
  };

  const getDocumentIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'id document':
      case 'mainid':
      case 'additionalid':
        return '🆔';
      case 'certificate document':
      case 'incorporation':
      case 'authorization':
      case 'exemption':
      case 'company certificate':
      case 'certificate':
        return '🏢';
      default:
        return '📄';
    }
  };

  const getCertTypeName = (certType) => {
    switch (certType?.toLowerCase()) {
      case 'incorporation':
        return 'תעודת התאגדות';
      case 'authorization':
        return 'תעודת הרשאה';
      case 'exemption':
        return 'תעודת פטור';
      default:
        return certType || 'לא ידוע';
    }
  };

  const renderExtractedData = (document) => {
    const data = document.extractedData;
    if (!data) return null;

    const isHebrewText = (text) => {
      return /[\u0590-\u05FF]/.test(text);
    };

    const renderField = (key, value) => {
      // If the value is missing, still render an empty input in edit mode so the user can fill it
      if (value === null || value === undefined) {
        if (isEditing) {
          value = '';
        } else {
          return null;
        }
      }
      
      const isHebrew = typeof value === 'string' && isHebrewText(value);
      const fieldName = key === 'CompanyNameHeb' ? 'שם החברה' :
                       key === 'BusinessId' ? 'מספר עסק' :
                       key === 'IssuedDate' ? 'תאריך הנפקה' :
                       key === 'LastName' ? 'שם משפחה' :
                       key === 'FirstName' ? 'שם פרטי' :
                       key === 'DateOfBirth' ? 'תאריך לידה' :
                       key === 'IdNumber' ? 'מספר תעודה' :
                       key === 'Role' ? 'תפקיד' :
                       key === 'IdType' ? 'סוג תעודה' :
                       key === 'ValidUntil' ? 'תוקף עד' :
                       key === 'cert_type' ? 'סוג המסמך' :
                       key === 'officeAdr' ? 'כתובת משרדי העסק' :
                       key === 'mailAdr' ? 'כתובת משרדי העסק לשליחת מכתבים' :
                       key;
      
      // Convert cert_type value to Hebrew display name
      const displayValue = key === 'cert_type' ? getCertTypeName(value) : value;

      if (isEditing) {
        // Edit mode - show input field
        return (
          <div key={key} className={`data-field editable ${isHebrew ? 'hebrew-text' : ''}`}>
            <span className="field-label">{fieldName}:</span>
            <input
              type="text"
              className="field-input"
              value={String(displayValue)}
              onChange={(e) => handleExtractedDataEdit(document.id, key, e.target.value)}
              dir={isHebrew ? 'rtl' : 'ltr'}
            />
          </div>
        );
      } else {
        // View mode - show text
        return (
          <div key={key} className={`data-field ${isHebrew ? 'hebrew-text' : ''}`}>
            <span className="field-label">{fieldName}:</span>
            <span className="field-value">{String(displayValue)}</span>
          </div>
        );
      }
    };

    // Group fields by document type and add headers
    const renderGroupedFields = () => {
      const isIdDocument = document.type === 'ID Document' || document.type === 'mainId' || document.type === 'additionalId';
      const lowerType = (document.type || '').toLowerCase();
      const isCompanyDocument = lowerType === 'company certificate' || lowerType === 'certificate' || lowerType === 'certificate document' || lowerType === 'incorporation' || lowerType === 'authorization' || lowerType === 'exemption';
      
      if (isIdDocument) {
        // ID Document fields
        const idFields = ['FirstName', 'LastName', 'DateOfBirth', 'IdNumber', 'IssuedDate', 'ValidUntil', 'IdType', 'Role'];
        const idData = {};
        idFields.forEach(field => {
          if (data[field] !== null && data[field] !== undefined) {
            idData[field] = data[field];
          }
        });

        return (
          <div className="data-section">
            <h4 className="section-header">תעודות זהות</h4>
            <div className="data-fields">
              {Object.entries(idData).map(([key, value]) => renderField(key, value))}
            </div>
          </div>
        );
      } else if (isCompanyDocument) {
        // Company Document fields - split into two subsections
        const companyFields = ['CompanyNameHeb', 'BusinessId', 'IssuedDate', 'cert_type'];
        const addressFields = ['officeAdr', 'mailAdr'];
        
        // Always create objects with keys present (empty string if missing)
        const companyData = {};
        const addressData = {};
        
        companyFields.forEach(field => {
          companyData[field] = data[field] !== null && data[field] !== undefined ? data[field] : '';
        });
        addressFields.forEach(field => {
          addressData[field] = data[field] !== null && data[field] !== undefined ? data[field] : '';
        });

        return (
          <div className="data-section">
            <h4 className="section-header">פרטי חברה</h4>
            
            {/* Company details subsection */}
            <div className="subsection">
              <h5 className="subsection-header">פרטי החברה</h5>
              <div className="data-fields">
                {Object.entries(companyData).map(([key, value]) => renderField(key, value))}
              </div>
            </div>
            
            {/* Address subsection */}
            <div className="subsection">
              <h5 className="subsection-header">כתובות החברה</h5>
              <div className="data-fields">
                {Object.entries(addressData).map(([key, value]) => renderField(key, value))}
              </div>
            </div>
          </div>
        );
      } else {
        // Default - show all fields without grouping
        return (
          <div className="data-fields">
            {Object.entries(data).map(([key, value]) => renderField(key, value))}
          </div>
        );
      }
    };

    return (
      <div className="extracted-data">
        <h4>נתונים שחולצו:</h4>
        {renderGroupedFields()}
      </div>
    );
  };

  useEffect(() => {
    if (sessionId) {
      fetchDocuments();
    }
  }, [sessionId, refreshCount, fetchDocuments]);

  if (loading) {
    return (
      <div className="documents-view">
        <div className="documents-header">
          <button className="back-btn" onClick={onBackToUpload}>
            → חזור להעלאה 
          </button>
          <h2>אימות פרטים - Session ID: {sessionId}</h2>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען מסמכים...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documents-view">
        <div className="documents-header">
          <button className="back-btn" onClick={onBackToUpload}>
            → חזור להעלאה 
          </button>
          <h2>אימות פרטים - Session ID: {sessionId}</h2>
        </div>
        <div className="error-container">
          <i className="error-icon">⚠️</i>
          <h3>שגיאה בטעינת מסמכים</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={handleRefresh}>
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="documents-view">
        <div className="documents-header">
          <button className="back-btn" onClick={onBackToUpload}>
            → חזור להעלאה 
          </button>
          <h2>אימות פרטים - Session ID: {sessionId}</h2>
        </div>
        <div className="empty-state">
          <i className="empty-icon">📄</i>
          <h3>לא נמצאו מסמכים</h3>
          <p>לא נמצאו מסמכים עבור Session ID זה.</p>
          <button className="retry-btn" onClick={handleRefresh}>
            רענן
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-view">
      <div className="documents-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBackToUpload}>
            → חזור להעלאה 
          </button>
          <div className="session-info">
            <span className="session-label">Session ID:</span>
            <span className="session-id">{sessionId}</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="header-actions">
            <button 
              className={`edit-btn ${isEditing ? 'active' : ''}`}
              onClick={() => {}} // Edit mode is always active
            >
              ✏️ עריכה
            </button>
            
            {isEditing && (
              <>
                <button className="cancel-btn" onClick={handleCancelEdit}>
                  ביטול
                </button>
                <button 
                  className="save-btn" 
                  onClick={handleSaveToSupabase}
                  disabled={saving}
                >
                  {saving ? 'שומר...' : '💾 שמור'}
                </button>
              </>
            )}
            
            <button 
              className="refresh-btn" 
              onClick={handleRefresh}
              disabled={loading}
            >
              🔄 רענן
            </button>
          </div>
        </div>
      </div>

      {summary && (
        <div className="summary-section">
          <div className="summary-card">
            <h3>סיכום מסמכים</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-number">{summary.total}</span>
                <span className="stat-label">סה"כ</span>
              </div>
              <div className="stat">
                <span className="stat-number">{summary.processed}</span>
                <span className="stat-label">עובדו</span>
              </div>
              <div className="stat">
                <span className="stat-number">{summary.processing}</span>
                <span className="stat-label">בעיבוד</span>
              </div>
              <div className="stat">
                <span className="stat-number">{summary.error}</span>
                <span className="stat-label">שגיאות</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="documents-container">
        <div className="documents-summary">
          <div className="summary-text">
            נמצאו {documents.length} מסמך{documents.length !== 1 ? 'ים' : ''}
          </div>
        </div>

        <div className="documents-grid">
          {editableDocuments.map((document) => (
            <div key={document.id} className="document-card">
              <div className="document-header">
                <div className="document-icon">
                  <span>{getDocumentIcon(document.type)}</span>
                </div>
                <div className="document-info">
                  <div className="document-title">
                    {document.filename || 'מסמך ללא שם'}
                  </div>
                  <div className="document-filename">
                    {document.type || 'סוג לא ידוע'}
                  </div>
                  <div className={`document-status ${getStatusClass(document.status)}`}>
                    {document.status || 'לא ידוע'}
                  </div>
                </div>
              </div>

              <div className="document-details">
                <div className="detail-row">
                  <span className="detail-label">תאריך העלאה:</span>
                  <span className="detail-value">{formatDate(document.uploadDate)}</span>
                </div>
                {document.processedDate && (
                  <div className="detail-row">
                    <span className="detail-label">תאריך עיבוד:</span>
                    <span className="detail-value">{formatDate(document.processedDate)}</span>
                  </div>
                )}
              </div>

              {document.extractedData && (
                renderExtractedData(document)
              )}

              {saveError && (
                <div className="save-error">
                  <div className="error-message">
                    שגיאה בשמירה: {saveError}
                  </div>
                </div>
              )}

              <div className="approve-section">
                <button 
                  className="approve-btn"
                  onClick={handleApproveData}
                  disabled={saving}
                >
                  ✅ אשר נתונים
                </button>
                <div className="approve-note">
                  לחיצה על כפתור זה תאשר את כל הנתונים ותשמור אותם במסד הנתונים
                </div>
              </div>

              <div className="document-actions">
                {document.downloadUrl && (
                  <a 
                    href={document.downloadUrl} 
                    download={document.filename}
                    className="download-btn"
                  >
                    📥 הורד
                  </a>
                )}
                
                <button 
                  className="update-supabase-btn"
                  onClick={() => handleUpdateSingleDocument(document)}
                  disabled={saving}
                >
                  🔄 עדכן במסד נתונים
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentsView;
