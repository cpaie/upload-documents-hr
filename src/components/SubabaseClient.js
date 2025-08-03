// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jupbjbcskoetisooirza.supabase.co';
const supabaseKey = 'sb_publishable_VPQY7rsQ42VHXxR7bfjaDQ_E9V-GPoI'; // public key
export const supabase = createClient(supabaseUrl, supabaseKey);
