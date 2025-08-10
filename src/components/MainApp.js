import React, { useState } from 'react';
import DataGrid from './DataGrid';
import PDFUploadForm from './PDFUploadForm';
import DocumentsView from './DocumentsView';

const MainApp = ({ user }) => {
  const [currentView, setCurrentView] = useState('form'); // 'form', 'data', or 'documents'
  const [fetchedData] = useState([]);
  const [lastFormData] = useState(null); // Store last form data for resend
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [savedFormData, setSavedFormData] = useState(null); // Store form data for preservation
  const [savedUploadedFiles, setSavedUploadedFiles] = useState(null); // Store uploaded files for preservation
  const [cameFromDocumentsView, setCameFromDocumentsView] = useState(false);


      const handleSessionIdReceived = (sessionId, responseData, formData, uploadedFiles) => {
      // Save form data and uploaded files for preservation
      setSavedFormData(formData);
      setSavedUploadedFiles(uploadedFiles);
      
      setCurrentSessionId(sessionId);
      
      // If we're coming from PDFUploadForm back button (responseData is null)
      // and we had previously come FROM DocumentsView, navigate back to documents
      if (responseData === null && cameFromDocumentsView) {
        setCurrentView('documents');
        setCameFromDocumentsView(false); // Reset flag
      } else {
        setCurrentView('documents');
        setCameFromDocumentsView(false); // Reset flag when going to documents view
      }
    };

  const handleBackToForm = () => {
    setCurrentView('form');
    setCurrentSessionId(null);
    setCameFromDocumentsView(false); // Reset flag when going back to form
  };

  const handleBackToUpload = () => {
    setCurrentView('form');
    // Don't clear currentSessionId - we need it for the back button
    setCameFromDocumentsView(true); // Set flag when coming back from documents view
    // Don't clear saved data - it will be restored in PDFUploadForm
  };

  const handleDataApproved = (sessionId, documents) => {
    
    // Here you can add logic for the next step
    // For now, we'll just show an alert
    alert('הנתונים אושרו! המעבר לשלב הבא יתווסף בהמשך.');
    
    // You can add navigation to the next view here
    // setCurrentView('nextStep');
  };

  const handleResendForm = () => {
    // console.log('[DEV] Resending form with last data:', lastFormData);
    if (lastFormData) {
      // Go back to form and trigger resend
      setCurrentView('form');
    } else {
      console.warn('[DEV] No previous form data available for resend');
    }
  };

  return (
    <div className="main-app">
      {currentView === 'form' && (
        <PDFUploadForm 
          user={user}
          onSessionIdReceived={handleSessionIdReceived}
          savedFormData={savedFormData}
          savedUploadedFiles={savedUploadedFiles}
          cameFromDocumentsView={cameFromDocumentsView}
          currentSessionId={currentSessionId}
          onFormDataSaved={(formData, uploadedFiles) => {
            if (formData === null && uploadedFiles === null) {
              // Clear saved data
              setSavedFormData(null);
              setSavedUploadedFiles(null);
            } else {
              // Save form data
              setSavedFormData(formData);
              setSavedUploadedFiles(uploadedFiles);
            }
          }}
        />
      )}
      
      {currentView === 'data' && (
        <div className="data-view">
          <div className="back-button-container" style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem',
            justifyContent: 'flex-start'
          }}>
            <button 
              className="back-button"
              onClick={handleBackToForm}>
              <span>←</span> חזור לטופס 
            </button>
            <button 
              className="refresh-button"
              onClick={handleResendForm}
              style={{
                background: lastFormData ? '#28a745' : '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: lastFormData ? 'pointer' : 'not-allowed',
                fontSize: '1rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: lastFormData ? 1 : 0.6
              }}
              disabled={!lastFormData}>
              <span>🔄</span> שלח שוב (Dev)
            </button>
          </div>
          <DataGrid initialData={fetchedData} user={user} />
        </div>
      )}

      {currentView === 'documents' && currentSessionId && (
        <DocumentsView 
          sessionId={currentSessionId}
          onBackToUpload={handleBackToUpload}
          onDataApproved={handleDataApproved}
        />
      )}
    </div>
  );
};

export default MainApp; 