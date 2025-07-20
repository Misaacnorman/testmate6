import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function for error handling
export const handleError = (error: unknown) => {
  console.error('API Error:', error);
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  throw new Error('An unknown error occurred');
};