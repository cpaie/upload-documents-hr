import React, { useState, useEffect } from 'react';
import './App.css';
import MainApp from './components/MainApp';
import SignupPopup from './components/SignupPopup';
import { supabase } from './components/SubabaseClient.js';

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add logging for user state changes
  useEffect(() => {
    console.log('[App] User state changed:', user);
    console.log('[App] User state type:', typeof user);
    console.log('[App] User state is null:', user === null);
    console.log('[App] User state is object:', typeof user === 'object');
    if (user) {
      console.log('[App] User email:', user.email);
      console.log('[App] User provider:', user.provider);
      console.log('[App] User object keys:', Object.keys(user));
      
      // Store Google OAuth user in localStorage to prevent loss
      if (user.provider === 'google') {
        console.log('[App] Storing Google OAuth user in localStorage');
        localStorage.setItem('googleOAuthUser', JSON.stringify(user));
      }
    } else {
      console.log('[App] User is null or undefined');
      
      // Check if we have a stored Google OAuth user
      const storedUser = localStorage.getItem('googleOAuthUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('[App] Found stored Google OAuth user, restoring:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('[App] Error parsing stored user:', error);
          localStorage.removeItem('googleOAuthUser');
        }
      }
    }
  }, [user]);

  useEffect(() => {
    console.log('[App] useEffect triggered - checking for OAuth callback parameters');
    console.log('[App] Current URL:', window.location.href);
    console.log('[App] Window location search:', window.location.search);
    
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth_success');
    const authError = urlParams.get('auth_error');
    const userData = urlParams.get('user');

    console.log('[App] URL parameters found:', { 
      authSuccess, 
      authError, 
      userData: userData ? 'present' : 'missing',
      userDataLength: userData ? userData.length : 0
    });
    
    // Log all URL parameters for debugging
    console.log('[App] All URL parameters:');
    for (const [key, value] of urlParams.entries()) {
      console.log(`[App] ${key}: ${value}`);
    }

    if (authSuccess === 'true' && userData) {
      try {
        console.log('[App] OAuth callback received with user data');
        console.log('[App] Raw user data:', userData);
        const decodedData = decodeURIComponent(userData);
        console.log('[App] Decoded user data:', decodedData);
        const user = JSON.parse(decodedData);
        console.log('[App] Parsed user object:', user);
        console.log('[App] Setting user state to:', user);
        
        // Set user state immediately
        setUser(user);
        console.log('[App] User state set successfully');
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log('[App] URL parameters cleaned up');
        
        // Force a re-render check
        setTimeout(() => {
          console.log('[App] Checking user state after 100ms:', user);
        }, 100);
      } catch (error) {
        console.error('[App] Error parsing user data:', error);
        console.error('[App] Error details:', error.message);
      }
    } else if (authError) {
      console.error('[App] OAuth error:', authError);
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else {
      console.log('[App] No OAuth callback parameters found');
    }

    // Check for existing session
    const getSession = async () => {
      try {
        console.log('[App] Checking Supabase session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[App] Supabase session:', session);
        console.log('[App] Supabase user:', session?.user);
        
        // Only set user from Supabase if we don't have a Google OAuth user
        if (!user || user.provider !== 'google') {
          console.log('[App] Setting user from Supabase session');
          setUser(session?.user || null);
        } else {
          console.log('[App] Keeping Google OAuth user, not overwriting with Supabase');
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
          console.log('[App] Supabase auth state change:', event, session?.user);
          
          // IMPORTANT: Don't overwrite Google OAuth user with Supabase
          if (user && user.provider === 'google') {
            console.log('[App] Keeping Google OAuth user, ignoring Supabase auth change');
            return;
          }
          
          console.log('[App] Setting user from Supabase auth change');
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
    console.log('[App] handleUserAuthenticated called with:', user);
    setUser(user);
    console.log('[App] User state should be updated');
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
          <p className="subtitle">Upload your PDF documents securely</p>
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