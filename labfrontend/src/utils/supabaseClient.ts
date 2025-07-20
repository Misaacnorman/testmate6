/// <reference types="vite/client" />

// Vite provides types for import.meta.env globally. If you see TS errors, ensure you have a vite-env.d.ts file with:
// /// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const handleError = (error: unknown) => {
  console.error('API Error:', error);
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  throw new Error('An unknown error occurred');
};