// supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/environment.js';

console.log('[SupabaseClient] Initializing with config:', {
  url: SUPABASE_CONFIG.url,
  anonKey: SUPABASE_CONFIG.anonKey ? '***' : 'MISSING'
});

export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
