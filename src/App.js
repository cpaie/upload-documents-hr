import React, { useState, useEffect } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import './App.css';
import MainApp from './components/MainApp';
import SignupPopup from './components/SignupPopup';
import { supabase } from './components/SubabaseClient.js';
import { msalConfig } from './config/azureAuth';

// Initialize MSAL
const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleUserAuthenticated = (user) => {
    setUser(user);
  };

  const handleSignOut = async () => {
    try {
      // Sign out from Supabase if it's a Supabase user
      if (user && !user.provider) {
        await supabase.auth.signOut();
      }
      
      // Sign out from Azure if it's an Azure user
      if (user && user.provider === 'azure') {
        await msalInstance.logout();
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
    <MsalProvider instance={msalInstance}>
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
                  <button className="signout-button" onClick={handleSignOut}>
                    התנתק
                  </button>
                </div>
              ) : (
                <button className="signup-button" onClick={() => setShowSignup(true)}>
                  התחבר / הרשם
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
    </MsalProvider>
  );
}

export default App; 