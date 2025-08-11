import React, { useState, useEffect } from 'react';
import './App.css';
import MainApp from './components/MainApp';
import SignupPopup from './components/SignupPopup';
import { supabase } from './components/SubabaseClient.js';

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle user state changes and localStorage persistence
  useEffect(() => {
    if (user) {
      // Store Google OAuth user in localStorage to prevent loss
      if (user.provider === 'google') {
        localStorage.setItem('googleOAuthUser', JSON.stringify(user));
      }
    } else {
      // Check if we have a stored Google OAuth user (only on initial load)
      const storedUser = localStorage.getItem('googleOAuthUser');
      if (storedUser && !user) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('[App] Error parsing stored user:', error);
          localStorage.removeItem('googleOAuthUser');
        }
      }
    }
  }, [user]);

  useEffect(() => {
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth_success');
    const authError = urlParams.get('auth_error');
    const userData = urlParams.get('user');

    if (authSuccess === 'true' && userData) {
      try {
        const decodedData = decodeURIComponent(userData);
        const user = JSON.parse(decodedData);
        
        // Set user state immediately
        setUser(user);
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('[App] Error parsing user data:', error);
      }
    } else if (authError) {
      console.error('[App] OAuth error:', authError);
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Only set user from Supabase if we don't have a Google OAuth user
        if (!user || user.provider !== 'google') {
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          // IMPORTANT: Don't overwrite Google OAuth user with Supabase
          if (user && user.provider === 'google') {
            return;
          }
          
          setUser(session?.user || null);
          setLoading(false);
        }
      );

      return () => {
        if (subscription && typeof subscription.unsubscribe === 'function') {
          subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.warn('[App] Could not set up Supabase auth listener:', error.message);
      // Return empty cleanup function
      return () => {};
    }
  }, [user]);

  const handleUserAuthenticated = (user) => {
    setUser(user);
  };

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase if it's a Supabase user
      if (user && !user.provider) {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.warn('[App] Could not sign out from Supabase:', error.message);
        }
      }
      
      // Sign out from Service Account if it's a service account user
      if (user && user.provider === 'service-account') {
        console.log('Service account user signed out');
      }
      
      // Sign out from Google OAuth if it's a Google user
      if (user && user.provider === 'google') {
        console.log('Google OAuth user signed out');
        // Clear stored Google OAuth user
        localStorage.removeItem('googleOAuthUser');
      }
      
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="logo">
            <i className="fas fa-file-pdf"></i>
            <h1>העלאת מסמכים</h1>
          </div>
          <div className="header-right">
            {user ? (
              <div className="user-section">
                <span className="user-email">{user.email}</span>
                {user.provider === 'service-account' && (
                  <span className="user-provider" style={{ fontSize: '12px', color: '#666' }}>
                    (Service Account)
                  </span>
                )}
                {user.provider === 'google' && (
                  <span className="user-provider" style={{ fontSize: '12px', color: '#666' }}>
                    (Google)
                  </span>
                )}
                <button className="signout-button" onClick={handleSignOut}>
                  התנתק
                </button>
              </div>
            ) : (
              <button className="signup-button" onClick={() => setShowSignup(true)}>
                התחברות
              </button>
            )}
          </div>
          <p className="subtitle">העלה מסמכים בצורה בטוחה</p>
        </header>

        <main className="main-content">
          <MainApp user={user} />
        </main>
      </div>

      <SignupPopup
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        onUserAuthenticated={handleUserAuthenticated}
      />
    </div>
  );
}

export default App; 