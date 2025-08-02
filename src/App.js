import React, { useState } from 'react';
import './App.css';
import PDFUploadForm from './components/PDFUploadForm';
import FirebaseUploadForm from './components/FirebaseUploadForm';
import { appConfig } from './config/firebase.config';

function App() {
  const [uploadMode, setUploadMode] = useState(appConfig.defaultUploadMode); // 'webhook' or 'firebase'

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="logo">
            <i className="fas fa-file-pdf"></i>
            <h1>PDF Upload React</h1>
          </div>
          <p className="subtitle">Upload your PDF documents securely</p>
          
          {/* Upload Mode Toggle */}
          <div className="upload-mode-toggle">
            <button 
              className={`toggle-btn ${uploadMode === 'webhook' ? 'active' : ''}`}
              onClick={() => setUploadMode('webhook')}
            >
              <i className="fas fa-link"></i>
              Webhook Upload
            </button>
            <button 
              className={`toggle-btn ${uploadMode === 'firebase' ? 'active' : ''}`}
              onClick={() => setUploadMode('firebase')}
            >
              <i className="fas fa-fire"></i>
              Firebase Upload
            </button>
          </div>
        </header>

        <main className="main-content">
          {uploadMode === 'webhook' ? (
            <PDFUploadForm />
          ) : (
            <FirebaseUploadForm />
          )}
        </main>
      </div>
    </div>
  );
}

export default App; 