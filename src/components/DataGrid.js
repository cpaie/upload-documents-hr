import React, { useState } from 'react';
import { supabase } from './SubabaseClient.js';
import './DataGrid.css';

const DataGrid = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: fetchedData, error } = await supabase
        .from('table_id')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setData(fetchedData || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="data-grid-container">
      <div className="data-grid-header">
        <h2>Person Data</h2>
        <button 
          className="fetch-button"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Data'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}

      {data.length > 0 && (
        <div className="data-grid">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Date of Birth</th>
                <th>ID Number</th>
                <th>Issued Date</th>
                <th>Valid Until</th>
                <th>Session ID</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.FirstName || '-'}</td>
                  <td>{row.LastName || '-'}</td>
                  <td>{formatDate(row.DateOfBirth)}</td>
                  <td>{row.IdNumber || '-'}</td>
                  <td>{formatDate(row.IssuedDate)}</td>
                  <td>{formatDate(row.ValidUntil)}</td>
                  <td>{row.SessionId || '-'}</td>
                  <td>{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data.length === 0 && !error && (
        <div className="no-data">
          Click "Fetch Data" to load person records from the database.
        </div>
      )}
    </div>
  );
};

export default DataGrid; 