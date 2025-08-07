// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/environment.js';

console.log('[SupabaseClient] Initializing with config:', {
  url: SUPABASE_CONFIG.url ? 'SET' : 'MISSING',
  anonKey: SUPABASE_CONFIG.anonKey ? 'SET' : 'MISSING',
  serviceRoleKey: SUPABASE_CONFIG.serviceRoleKey ? 'SET' : 'MISSING'
});

// Check if required Supabase configuration is available
let supabase;

if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  console.error('[SupabaseClient] ❌ Missing required Supabase configuration:');
  console.error('[SupabaseClient] - REACT_APP_SUPABASE_URL:', SUPABASE_CONFIG.url ? 'SET' : 'MISSING');
  console.error('[SupabaseClient] - REACT_APP_SUPABASE_ANON_KEY:', SUPABASE_CONFIG.anonKey ? 'SET' : 'MISSING');
  console.error('[SupabaseClient] Please check your .env file and ensure all required Supabase variables are set.');
  
  // Create a mock client that will throw errors when used
  supabase = {
    auth: {
      getSession: async () => {
        throw new Error('Supabase not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.');
      },
      signInWithPassword: async () => {
        throw new Error('Supabase not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.');
      },
      signOut: async () => {
        throw new Error('Supabase not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file.');
      },
      onAuthStateChange: (callback) => {
        console.warn('[SupabaseClient] onAuthStateChange called but Supabase is not configured');
        // Return a mock subscription that does nothing
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                console.log('[SupabaseClient] Mock subscription unsubscribed');
              }
            }
          }
        };
      }
    }
  };
} else {
  // Use service role key if available, otherwise use anon key
  const key = SUPABASE_CONFIG.serviceRoleKey || SUPABASE_CONFIG.anonKey;
  console.log('[SupabaseClient] ✅ Creating Supabase client with valid configuration');
  supabase = createClient(SUPABASE_CONFIG.url, key);
}

export { supabase };
