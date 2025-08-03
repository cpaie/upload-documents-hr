import React, { useState } from 'react';
import { supabase } from './SubabaseClient.js';
import './HebrewForm.css';

const HebrewForm = ({ onDataFetched, user }) => {
  const [formData, setFormData] = useState({
    jobDetails: '',
    mainIdImage: null,
    additionalIds: [],
    certificateType: '',
    certificateFile: null
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch data from Supabase table_id
      const { data: fetchedData, error } = await supabase
        .from('table_id')
        .select('*');
      
      if (error) {
        throw error;
      }

      // Call the callback function to pass data to parent component
      if (onDataFetched) {
        onDataFetched(fetchedData || []);
      }

    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
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
      <h2 className="form-title">טופס העלאת מסמכים</h2>
      
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
            <h3>ת״ז נוספות</h3>
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