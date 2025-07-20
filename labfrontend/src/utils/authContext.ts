import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';

// Define UserProfile type for better type safety
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
  };
  [key: string]: unknown; // For any additional fields with unknown type
}

// Create an auth context
export const AuthContext = createContext<{
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
}>({
  session: null,
  user: null,
  loading: true,
});