import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { supabase } from './SubabaseClient.js';
import { loginRequest } from '../config/azureAuth';
import './SignupPopup.css';

const SignupPopup = ({ isOpen, onClose, onUserAuthenticated }) => {
  const { instance } = useMsal();
  const [isSignUp, setIsSignUp] = useState(true);
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
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.user) {
          setMessage('המשתמש נוצר בהצלחה! בדוק את האימייל שלך לאישור.');
          onUserAuthenticated(data.user);
        }
      } else {
        // Sign in
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
      }
    } catch (err) {
      setError(err.message);
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAzureLogin = async () => {
    try {
      // Check if Azure is properly configured
      if (!instance || !loginRequest) {
        setError('Azure לא מוגדר כראוי. אנא בדוק את הגדרות Azure.');
        return;
      }

      const response = await instance.loginPopup(loginRequest);
      
      if (response) {
        // Create a user object similar to Supabase format
        const azureUser = {
          id: response.account.localAccountId,
          email: response.account.username,
          name: response.account.name,
          provider: 'azure'
        };
        
        // Call the callback to pass user data to parent
        if (onUserAuthenticated) {
          onUserAuthenticated(azureUser);
        }
      }
    } catch (error) {
      console.error('Azure login error:', error);
      if (error.message.includes('AADSTS700016')) {
        setError('Azure לא מוגדר כראוי. אנא בדוק את הגדרות Client ID ו-Tenant ID.');
      } else if (error.message.includes('AADSTS900023')) {
        setError('Tenant ID לא תקין. אנא בדוק את הגדרות Azure AD שלך.');
      } else if (error.message.includes('YOUR_AZURE_CLIENT_ID') || error.message.includes('YOUR_TENANT_ID')) {
        setError('Azure לא מוגדר. אנא הגדר את Client ID ו-Tenant ID בקובץ azureAuth.js');
      } else {
        setError('שגיאה בהתחברות עם Azure: ' + error.message);
      }
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
          <h2>{isSignUp ? 'הרשמה' : 'התחברות'}</h2>
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
            {loading ? 'טוען...' : (isSignUp ? 'הרשמה' : 'התחברות')}
          </button>
        </form>

        <div className="divider">
          <span>או</span>
        </div>

        <div className="azure-login-container">
          <button 
            className="azure-login-button"
            onClick={handleAzureLogin}
          >
            <svg className="azure-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.4 24H0L12 0h12L11.4 24zM12 6.4l6.08 14.4H12V6.4z"/>
            </svg>
            התחבר עם Microsoft Azure
          </button>
        </div>

        <div className="toggle-section">
          <p>
            {isSignUp ? 'יש לך כבר חשבון?' : 'אין לך חשבון?'}
            <button
              type="button"
              className="toggle-button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage('');
              }}
            >
              {isSignUp ? 'התחבר כאן' : 'הרשם כאן'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPopup; 