
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// ==========================================
// ENVIRONMENT VALIDATION
// ==========================================

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.'
  );
}

let parsedUrl;

try {
  parsedUrl = new URL(supabaseUrl);
} catch {
  throw new Error('SUPABASE_URL must be a valid URL.');
}

if (
  !['https:', 'http:'].includes(parsedUrl.protocol) ||
  !parsedUrl.hostname.endsWith('.supabase.co')
) {
  throw new Error('SUPABASE_URL must be a valid Supabase project URL.');
}

// ==========================================
// SUPABASE SERVER CLIENT
// ==========================================

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
