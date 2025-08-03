import React, { useState, useEffect } from 'react';
import './App.css';
import MainApp from './components/MainApp';
import SignupPopup from './components/SignupPopup';
import { supabase } from './components/SubabaseClient.js';

function App() {
  const [user, setUser] = useState(null);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
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
    await supabase.auth.signOut();
    setUser(null);
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
  );
}

export default App; 