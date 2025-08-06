import React, { useState } from 'react';
import { supabase } from './SubabaseClient.js';
import { SUPABASE_CONFIG } from '../config/environment.js';
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

  const handleGoogleLogin = async () => {
    try {
      console.log('[GoogleLogin] Starting real Google OAuth authentication...');
      setLoading(true);
      setError(null);
      
      console.log('[GoogleLogin] Fetching OAuth URL from server...');
      
      // Get the OAuth URL from the server
      const response = await fetch('http://localhost:3001/api/auth/google/url', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      console.log('[GoogleLogin] Response status:', response.status);
      console.log('[GoogleLogin] Response ok:', response.ok);
      
      const data = await response.json();
      console.log('[GoogleLogin] Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get OAuth URL');
      }
      
      console.log('[GoogleLogin] Redirecting to Google OAuth...');
      console.log('[GoogleLogin] Auth URL:', data.authUrl);
      
      // Redirect to Google OAuth
      window.location.href = data.authUrl;
      
    } catch (error) {
      console.error('[GoogleLogin] Google login error:', error);
      console.error('[GoogleLogin] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setError('שגיאה בהתחברות עם Google: ' + error.message);
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

        <div className="divider">
          <span>או</span>
        </div>

        <div className="google-login-container">
          <button 
            className="google-login-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'מתחבר...' : 'התחבר עם Google'}
          </button>
        </div>

        <div className="info-section">
          <p>
            אין לך חשבון? אנא פנה למנהל המערכת להרשמה.
          </p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            התחברות עם Google נדרשת לגישה למערכת. הקבצים יועלו לחשבון Google Drive של המערכת.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPopup; 