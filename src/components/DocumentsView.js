import React, { useState, useEffect, useCallback } from 'react';
import { documentsService } from '../services/documentsService';
import { supabase } from './SubabaseClient.js';
import './DocumentsView.css';

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
                DateOfBirth: extractedData.DateOfBirth || '',
                IdNumber: extractedData.IdNumber || '',
                IssuedDate: extractedData.IssuedDate || '',
                ValidUntil: extractedData.ValidUntil || '',
                IdType: extractedData.IdType || '',
                Role: extractedData.Role || ''
              })
              .eq('SessionId', sessionId);

            if (error) {
              throw new Error(`Failed to update ID document: ${error.message}`);
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
                DateOfBirth: extractedData.DateOfBirth || '',
                IdNumber: extractedData.IdNumber || '',
                IssuedDate: extractedData.IssuedDate || '',
                ValidUntil: extractedData.ValidUntil || '',
                IdType: extractedData.IdType || '',
                Role: extractedData.Role || ''
              });

            if (error) {
              throw new Error(`Failed to insert ID document: ${error.message}`);
            }
            console.log('[DocumentsView] Inserted new ID record');
          }
        } else if (doc.type === 'Certificate Document' || doc.type === 'incorporation' || doc.type === 'authorization' || doc.type === 'exemption') {
          console.log('[DocumentsView] Saving certificate document data:', {
            SessionId: sessionId,
            CompanyNameHeb: extractedData.CompanyNameHeb,
            BusinessId: extractedData.BusinessId,
            IssuedDate: extractedData.IssuedDate
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
                IssuedDate: extractedData.IssuedDate || ''
              })
              .eq('SessionId', sessionId);

            if (error) {
              throw new Error(`Failed to update certificate document: ${error.message}`);
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
                IssuedDate: extractedData.IssuedDate || ''
              });

            if (error) {
              throw new Error(`Failed to insert certificate document: ${error.message}`);
            }
            console.log('[DocumentsView] Inserted new certificate record');
          }
        }
      }

      console.log('[DocumentsView] Successfully saved all documents in Supabase');
      
      // Update local state
      setDocuments(editableDocuments);
      // Stay in edit mode after saving
      
      // Show success message
      alert('הנתונים נשמרו בהצלחה ב-Supabase!');
      
    } catch (err) {
      console.error('[DocumentsView] Error saving to Supabase:', err);
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleApproveData = async () => {
    console.log('[DocumentsView] Approving data and updating all documents to Supabase');
    setSaving(true);
    setSaveError(null);
    
    try {
      // Update all documents to Supabase before proceeding
      const documentsToUpdate = isEditing ? editableDocuments : documents;
      
      for (const document of documentsToUpdate) {
        console.log('[DocumentsView] Updating document for approval:', document.id);
        const extractedData = document.extractedData || {};
        
        if (document.type === 'ID Document' || document.type === 'mainId' || document.type === 'additionalId') {
          console.log('[DocumentsView] Updating ID document for approval:', document.id, 'Type:', typeof document.id);
          
          // Check if this document has a Supabase ID (meaning it exists in the database)
          if (document.id && typeof document.id === 'number') {
            // Update existing record using the unique ID
            const { error } = await supabase
              .from('table_id')
              .update({
                FirstName: extractedData.FirstName || '',
                LastName: extractedData.LastName || '',
                DateOfBirth: extractedData.DateOfBirth || '',
                IdNumber: extractedData.IdNumber || '',
                IssuedDate: extractedData.IssuedDate || '',
                ValidUntil: extractedData.ValidUntil || '',
                IdType: extractedData.IdType || '',
                Role: extractedData.Role || ''
              })
              .eq('id', document.id);

            if (error) {
              console.error('[DocumentsView] Error updating ID document:', error);
              throw new Error(`Failed to update ID document: ${error.message}`);
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
                DateOfBirth: extractedData.DateOfBirth || '',
                IdNumber: extractedData.IdNumber || '',
                IssuedDate: extractedData.IssuedDate || '',
                ValidUntil: extractedData.ValidUntil || '',
                IdType: extractedData.IdType || '',
                Role: extractedData.Role || ''
              });

            if (error) {
              console.error('[DocumentsView] Error inserting ID document:', error);
              throw new Error(`Failed to insert ID document: ${error.message}`);
            }
            console.log('[DocumentsView] Inserted new ID record for approval');
          }
        } else if (document.type === 'Certificate Document' || document.type === 'incorporation' || document.type === 'authorization' || document.type === 'exemption') {
          console.log('[DocumentsView] Updating certificate document for approval:', document.id, 'Type:', typeof document.id);
          
          // Check if this document has a Supabase ID (meaning it exists in the database)
          if (document.id && typeof document.id === 'number') {
            // Update existing record using the unique ID
            const { error } = await supabase
              .from('HR_cert_id')
              .update({
                CompanyNameHeb: extractedData.CompanyNameHeb || '',
                BusinessId: extractedData.BusinessId || '',
                IssuedDate: extractedData.IssuedDate || ''
              })
              .eq('id', document.id);

            if (error) {
              console.error('[DocumentsView] Error updating certificate document:', error);
              throw new Error(`Failed to update certificate document: ${error.message}`);
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
                IssuedDate: extractedData.IssuedDate || ''
              });

            if (error) {
              console.error('[DocumentsView] Error inserting certificate document:', error);
              throw new Error(`Failed to insert certificate document: ${error.message}`);
            }
            console.log('[DocumentsView] Inserted new certificate record for approval');
          }
        }
      }
      
      console.log('[DocumentsView] All documents updated successfully for approval');
      
      // Show success message
      alert('כל הנתונים עודכנו בהצלחה! מעבר לשלב הבא...');
      
      // Proceed to next step
      if (onDataApproved) {
        onDataApproved(sessionId, documentsToUpdate);
      }
      
    } catch (error) {
      console.error('[DocumentsView] Error updating documents for approval:', error);
      setSaveError(`שגיאה בעדכון הנתונים: ${error.message}`);
      alert(`שגיאה בעדכון הנתונים: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSingleDocument = async (document) => {
    console.log('[DocumentsView] Updating single document:', document);
    setSaving(true);
    setSaveError(null);
    
    try {
      const extractedData = document.extractedData || {};
      
      if (document.type === 'ID Document' || document.type === 'mainId' || document.type === 'additionalId') {
        console.log('[DocumentsView] Updating ID document:', document.id, 'Type:', typeof document.id);
        
        // Check if this document has a Supabase ID (meaning it exists in the database)
        if (document.id && typeof document.id === 'number') {
          // Update existing record using the unique ID
          const { error } = await supabase
            .from('table_id')
            .update({
              FirstName: extractedData.FirstName || '',
              LastName: extractedData.LastName || '',
              DateOfBirth: extractedData.DateOfBirth || '',
              IdNumber: extractedData.IdNumber || '',
              IssuedDate: extractedData.IssuedDate || '',
              ValidUntil: extractedData.ValidUntil || '',
              IdType: extractedData.IdType || '',
              Role: extractedData.Role || ''
            })
            .eq('id', document.id);

          if (error) {
            console.error('[DocumentsView] Error updating ID document:', error);
            throw new Error(`Failed to update ID document: ${error.message}`);
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
              DateOfBirth: extractedData.DateOfBirth || '',
              IdNumber: extractedData.IdNumber || '',
              IssuedDate: extractedData.IssuedDate || '',
              ValidUntil: extractedData.ValidUntil || '',
              IdType: extractedData.IdType || '',
              Role: extractedData.Role || ''
            });

          if (error) {
            console.error('[DocumentsView] Error inserting ID document:', error);
            throw new Error(`Failed to insert ID document: ${error.message}`);
          }
          console.log('[DocumentsView] Inserted new ID record');
        }
      } else if (document.type === 'Certificate Document' || document.type === 'incorporation' || document.type === 'authorization' || document.type === 'exemption') {
        console.log('[DocumentsView] Updating certificate document:', document.id);
        
        // Check if this document has a Supabase ID (meaning it exists in the database)
        if (document.id && typeof document.id === 'number') {
          // Update existing record using the unique ID
          const { error } = await supabase
            .from('HR_cert_id')
            .update({
              CompanyNameHeb: extractedData.CompanyNameHeb || '',
              BusinessId: extractedData.BusinessId || '',
              IssuedDate: extractedData.IssuedDate || ''
            })
            .eq('id', document.id);

          if (error) {
            console.error('[DocumentsView] Error updating certificate document:', error);
            throw new Error(`Failed to update certificate document: ${error.message}`);
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
              IssuedDate: extractedData.IssuedDate || ''
            });

          if (error) {
            console.error('[DocumentsView] Error inserting certificate document:', error);
            throw new Error(`Failed to insert certificate document: ${error.message}`);
          }
          console.log('[DocumentsView] Inserted new certificate record');
        }
      }
      
      alert(`המסמך "${document.documentType || document.type}" עודכן בהצלחה!`);
      
    } catch (error) {
      console.error('[DocumentsView] Error updating single document:', error);
      setSaveError(`שגיאה בעדכון המסמך: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
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
    switch (type) {
      case 'ID Document':
        return '🆔';
      case 'Certificate Document':
        return '📜';
      default:
        return '📄';
    }
  };

  const getCertTypeName = (certType) => {
    switch (certType) {
      case 'incorporation':
        return 'התאגדות';
      case 'authorization':
        return 'עוסק מורשה';
      case 'exemption':
        return 'עוסק פטור';
      default:
        return certType;
    }
  };

  const renderExtractedData = (document) => {
    const data = document.extractedData;
    if (!data) return null;

    const isHebrewText = (text) => {
      return /[\u0590-\u05FF]/.test(text);
    };

    const renderField = (key, value) => {
      if (value === null || value === undefined) return null;
      
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

    return (
      <div className="extracted-data">
        <h4>נתונים שחולצו:</h4>
        <div className="data-fields">
          {Object.entries(data).map(([key, value]) => renderField(key, value))}
        </div>
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
          <h2>מסמכים עבור Session ID: {sessionId}</h2>
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
            ← חזור להעלאה
          </button>
          <h2>מסמכים עבור Session ID: {sessionId}</h2>
        </div>
        <div className="error-container">
          <p className="error-message">שגיאה בטעינת מסמכים: {error}</p>
          <button className="retry-btn" onClick={handleRefresh}>
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="documents-view">
      <div className="documents-header">
        <button className="back-btn" onClick={onBackToUpload}>
          ← חזור להעלאה
        </button>
        <h2>מסמכים עבור Session ID: <span className="session-id">{sessionId}</span></h2>
        <div className="header-actions">
          <button className="refresh-btn" onClick={handleCancelEdit}>
            🔄 בטל שינויים
          </button>
        </div>
      </div>

      {summary && (
        <div className="summary-section">
          <div className="summary-card">
            <h3>סיכום</h3>
            <div className="summary-stats">
              <div className="stat">
                <span className="stat-number">{summary.totalDocuments}</span>
                <span className="stat-label">סה"כ מסמכים</span>
              </div>
              <div className="stat">
                <span className="stat-number">{summary.idDocuments}</span>
                <span className="stat-label">תעודות זהות</span>
              </div>
              <div className="stat">
                <span className="stat-number">{summary.certificateDocuments}</span>
                <span className="stat-label">תעודות חברה</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="empty-state">
          <p>לא נמצאו מסמכים עבור Session ID זה</p>
          <button className="retry-btn" onClick={handleRefresh}>
            נסה שוב
          </button>
        </div>
      ) : (
        <div className="documents-grid">
          {(isEditing ? editableDocuments : documents).map((document) => (
            <div key={document.id} className="document-card">
              <div className="document-header">
                <div className="document-icon">
                  {getDocumentIcon(document.type)}
                </div>
                <div className="document-info">
                  <h3 className="document-title">{document.documentType || document.type}</h3>
                  <p className="document-filename">{document.fileName}</p>
                </div>
                <div className={`document-status ${getStatusClass(document.status)}`}>
                  {document.status === 'processed' ? 'עובד' : 
                   document.status === 'processing' ? 'מעבד' : 
                   document.status === 'error' ? 'שגיאה' : document.status}
                </div>
              </div>

              <div className="document-details">
                <div className="detail-row">
                  <span className="detail-label">גודל קובץ:</span>
                  <span className="detail-value">{document.fileSize}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">תאריך העלאה:</span>
                  <span className="detail-value">{formatDate(document.uploadDate)}</span>
                </div>
              </div>

              {renderExtractedData(document)}

              <div className="document-actions">
                <button
                  className="update-supabase-btn"
                  onClick={() => handleUpdateSingleDocument(document)}
                  disabled={saving}
                >
                  {saving ? '💾 שומר...' : '💾 עדכן Supabase'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error message for save operations */}
      {saveError && (
        <div className="save-error">
          <p className="error-message">שגיאה בשמירה: {saveError}</p>
          <button className="retry-btn" onClick={handleSaveToSupabase}>
            נסה שוב
          </button>
        </div>
      )}

      {/* Approve Data Button */}
      <div className="approve-section">
        <button 
          className="approve-btn" 
          onClick={handleApproveData}
          disabled={saving}
        >
          {saving ? '💾 מעדכן נתונים...' : '✅ אשר נתונים'}
        </button>
        <p className="approve-note">
          {saving ? 'מעדכן את כל הנתונים ב-Supabase...' : 'לחץ על "אשר נתונים" כדי לעבור לשלב הבא'}
        </p>
      </div>
    </div>
  );
};

export default DocumentsView; 