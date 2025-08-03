import React, { useState } from 'react';
import HebrewForm from './HebrewForm';
import DataGrid from './DataGrid';

const MainApp = ({ user }) => {
  const [currentView, setCurrentView] = useState('form'); // 'form' or 'data'
  const [fetchedData, setFetchedData] = useState([]);

  const handleDataFetched = (data) => {
    setFetchedData(data);
    setCurrentView('data');
  };

  const handleBackToForm = () => {
    setCurrentView('form');
  };

  return (
    <div className="main-app">
      {currentView === 'form' ? (
        <HebrewForm onDataFetched={handleDataFetched} user={user} />
      ) : (
        <div className="data-view">
          <div className="back-button-container">
            <button 
              className="back-button"
              onClick={handleBackToForm}
            >
              ← חזור לטופס
            </button>
          </div>
          <DataGrid initialData={fetchedData} user={user} />
        </div>
      )}
    </div>
  );
};

export default MainApp; 