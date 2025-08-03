import React, { useState, useEffect } from 'react';
import { supabase } from './SubabaseClient.js';
import './DataGrid.css';

const DataGrid = ({ initialData = [], user }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editableData, setEditableData] = useState([]);
  const [saving, setSaving] = useState(false);

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

  // Update data when initialData prop changes
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setData(initialData);
    }
  }, [initialData]);

  // Update editable data when data changes
  useEffect(() => {
    if (data.length > 0) {
      setEditableData(data.map(item => ({ ...item })));
    }
  }, [data]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const handleInputChange = (index, field, value) => {
    setEditableData(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update each record in Supabase using UPDATE
      const updatePromises = editableData.map(async (person) => {
        const { error } = await supabase
          .from('table_id')
          .update({
            FirstName: person.FirstName,
            LastName: person.LastName,
            DateOfBirth: person.DateOfBirth,
            IdNumber: person.IdNumber,
            IssuedDate: person.IssuedDate,
            ValidUntil: person.ValidUntil,
            SessionId: person.SessionId
          })
          .eq('id', person.id);
        
        if (error) {
          throw error;
        }
        return person;
      });

      await Promise.all(updatePromises);
      
      // Update local state
      setData(editableData);
      alert('הנתונים נשמרו בהצלחה!');
    } catch (err) {
      console.error('Error saving data:', err);
      alert(`שגיאה בשמירת הנתונים: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="data-grid-container">
      <div className="data-grid-header">
        <h2>עריכת נתוני אנשים</h2>
        <div className="header-buttons">
          <button 
            className="fetch-button"
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'טוען...' : 'טען נתונים'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          שגיאה: {error}
        </div>
      )}

      {editableData.length > 0 && (
        <div className="editable-forms">
          {editableData.map((person, index) => (
            <div key={person.id} className="person-form">
              <h3 className="person-title">אדם מספר {index + 1}</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">שם פרטי</label>
                  <input
                    type="text"
                    className="form-input"
                    value={person.FirstName || ''}
                    onChange={(e) => handleInputChange(index, 'FirstName', e.target.value)}
                    placeholder="הכנס שם פרטי"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">שם משפחה</label>
                  <input
                    type="text"
                    className="form-input"
                    value={person.LastName || ''}
                    onChange={(e) => handleInputChange(index, 'LastName', e.target.value)}
                    placeholder="הכנס שם משפחה"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">תאריך לידה</label>
                  <input
                    type="date"
                    className="form-input"
                    value={person.DateOfBirth ? person.DateOfBirth.split('T')[0] : ''}
                    onChange={(e) => handleInputChange(index, 'DateOfBirth', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">מספר תעודת זהות</label>
                  <input
                    type="text"
                    className="form-input"
                    value={person.IdNumber || ''}
                    onChange={(e) => handleInputChange(index, 'IdNumber', e.target.value)}
                    placeholder="הכנס מספר תעודת זהות"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">תאריך הנפקה</label>
                  <input
                    type="date"
                    className="form-input"
                    value={person.IssuedDate ? person.IssuedDate.split('T')[0] : ''}
                    onChange={(e) => handleInputChange(index, 'IssuedDate', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">תוקף עד</label>
                  <input
                    type="date"
                    className="form-input"
                    value={person.ValidUntil ? person.ValidUntil.split('T')[0] : ''}
                    onChange={(e) => handleInputChange(index, 'ValidUntil', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">מזהה סשן</label>
                  <input
                    type="text"
                    className="form-input"
                    value={person.SessionId || ''}
                    onChange={(e) => handleInputChange(index, 'SessionId', e.target.value)}
                    placeholder="הכנס מזהה סשן"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">תאריך יצירה</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formatDate(person.created_at)}
                    disabled
                    style={{ backgroundColor: '#f8f9fa' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editableData.length > 0 && (
        <div className="bottom-save-section">
          <button 
            className="bottom-save-button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      )}

      {!loading && editableData.length === 0 && !error && (
        <div className="no-data">
          לחץ על "טען נתונים" כדי לטעון רשומות אנשים מהמסד נתונים.
        </div>
      )}
    </div>
  );
};

export default DataGrid; 