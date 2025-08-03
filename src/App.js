import React from 'react';
import './App.css';
import PDFUploadForm from './components/PDFUploadForm';
import DataGrid from './components/DataGrid';

function App() {
  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="logo">
            <i className="fas fa-file-pdf"></i>
            <h1>PDF Upload React</h1>
          </div>
          <p className="subtitle">Upload your PDF documents securely</p>
        </header>

        <main className="main-content">
          <PDFUploadForm />
          <DataGrid />
        </main>
      </div>
    </div>
  );
}

export default App; 