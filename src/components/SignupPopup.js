import React, { useState } from 'react';
import { supabase } from './SubabaseClient.js';

import './SignupPopup.css';

const SignupPopup = ({ isOpen, onClose, onUserAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      // Sign in only
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        setMessage('התחברת בהצלחה!');
        onUserAuthenticated(data.user);
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={handleClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={handleClose}>
          ×
        </button>
        
        <div className="popup-header">
          <h2>התחברות</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">אימייל</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="הכנס את האימייל שלך"
              required
              dir="rtl"
            />
          </div>

          <div className="form-group">
            <label className="form-label">סיסמה</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="הכנס את הסיסמה שלך"
              required
              dir="rtl"
              minLength={6}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'טוען...' : 'התחברות'}
          </button>
        </form>



        <div className="info-section">
          <p>
            אין לך חשבון? אנא פנה למנהל המערכת להרשמה.
          </p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            הקבצים יועלו באופן מאובטח ל-Google Cloud Storage של המערכת.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPopup; 