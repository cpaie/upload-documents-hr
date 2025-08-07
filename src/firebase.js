import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config/firebase.config';

console.log('[Firebase] Initializing with config:', {
  apiKey: firebaseConfig.apiKey ? 'SET' : 'MISSING',
  projectId: firebaseConfig.projectId ? 'SET' : 'MISSING',
  authDomain: firebaseConfig.authDomain ? 'SET' : 'MISSING'
});

// Initialize variables
let db, storage, auth, app;

// Check if required Firebase configuration is available
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('[Firebase] ❌ Missing required Firebase configuration:');
  console.error('[Firebase] - REACT_APP_FIREBASE_API_KEY:', firebaseConfig.apiKey ? 'SET' : 'MISSING');
  console.error('[Firebase] - REACT_APP_FIREBASE_PROJECT_ID:', firebaseConfig.projectId ? 'SET' : 'MISSING');
  console.error('[Firebase] Please check your .env file and ensure all required Firebase variables are set.');
  
  // Create mock Firebase services
  db = {
    collection: () => ({
      add: async () => {
        throw new Error('Firebase not configured. Please set Firebase environment variables in your .env file.');
      },
      get: async () => {
        throw new Error('Firebase not configured. Please set Firebase environment variables in your .env file.');
      }
    })
  };
  
  storage = {
    ref: () => ({
      put: async () => {
        throw new Error('Firebase not configured. Please set Firebase environment variables in your .env file.');
      }
    })
  };
  
  auth = {
    signInWithPopup: async () => {
      throw new Error('Firebase not configured. Please set Firebase environment variables in your .env file.');
    },
    signOut: async () => {
      throw new Error('Firebase not configured. Please set Firebase environment variables in your .env file.');
    }
  };
  
  app = null;
} else {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    console.log('[Firebase] ✅ Firebase initialized successfully');

    // Initialize Firebase services
    db = getFirestore(app);
    storage = getStorage(app);
    auth = getAuth(app);
  } catch (error) {
    console.error('[Firebase] ❌ Failed to initialize Firebase:', error);
    
    // Create mock services on initialization failure
    db = {
      collection: () => ({
        add: async () => {
          throw new Error('Firebase initialization failed. Please check your configuration.');
        },
        get: async () => {
          throw new Error('Firebase initialization failed. Please check your configuration.');
        }
      })
    };
    
    storage = {
      ref: () => ({
        put: async () => {
          throw new Error('Firebase initialization failed. Please check your configuration.');
        }
      })
    };
    
    auth = {
      signInWithPopup: async () => {
        throw new Error('Firebase initialization failed. Please check your configuration.');
      },
      signOut: async () => {
        throw new Error('Firebase initialization failed. Please check your configuration.');
      }
    };
    
    app = null;
  }
}

export { db, storage, auth };
export default app; 