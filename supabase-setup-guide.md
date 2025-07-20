# Testmate6 Supabase Setup Guide

This guide will help you deploy your Testmate6 application using Supabase for the backend and Vercel for the frontend.

## Part 1: Supabase Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New Project" 
3. Enter your project details:
   - Name: `Testmate6` (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose the region closest to your users
   - Pricing Plan: Select appropriate plan (Free tier is sufficient for testing)
4. Click "Create New Project" and wait for creation to complete

### 2. Setup Database Schema

1. In the Supabase dashboard, go to "SQL Editor"
2. Create a new query
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Click "Run" to execute the SQL script and create all tables
5. Create another query
6. Copy and paste the contents of `supabase-seed.sql` into the editor
7. Click "Run" to seed the database with initial data

### 3. Configure Authentication

1. Go to "Authentication" → "Settings" in the Supabase dashboard
2. Under "Email Auth":
   - Enable "Email Confirmations" (optional)
   - Enable "Secure Email Change" 
3. Under "JWT settings", note down the JWT expiry time (default is 3600 seconds / 1 hour)
4. Go to "Authentication" → "URL Configuration":
   - Set the Site URL to your Vercel deployment URL (once you have it)
   - Add redirect URLs for authentication callbacks (your-vercel-url/auth/callback)

### 4. Set Up Storage (for attachments)

1. Go to "Storage" in the Supabase dashboard
2. Create buckets for your application:
   - Click "New Bucket"
   - Name: `attachments`
   - Public/Private: Choose Private
   - Click "Create"
3. Set up access policies:
   - Go to the bucket you created
   - Click "Policies"
   - Add policies as needed (e.g., allow authenticated users to upload and view their attachments)

### 5. Get API Keys

1. Go to "Settings" → "API" in the Supabase dashboard
2. Note down:
   - Project URL
   - `anon` public key (safe for browser use)
   - `service_role` key (keep this secret, for secure server operations)

## Part 2: Frontend Deployment

### 1. Configure Environment Variables

1. Create a `.env.local` file in your `labfrontend` directory with:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Ensure your frontend code is using the Supabase client correctly. The existing code seems to be set up properly.

### 2. Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - Framework Preset: Vite
   - Root Directory: `labfrontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
7. Click "Deploy"

## Part 3: Connect Frontend to Supabase

Your frontend code is already set up to use Supabase as the backend. The `supabaseClient.ts` file is correctly importing the Supabase URL and anon key from environment variables.

Here's what's already correctly configured:

1. **Supabase Client Setup**:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey);
   ```

2. **API Functions**:
   Your API functions like `usersApi.ts` are already using the Supabase client for database operations.

## Part 4: Authentication Integration

To implement authentication:

1. Update your authentication flow in the frontend to use Supabase Auth. For example:

   ```typescript
   // Sign up
   const signUp = async (email, password) => {
     const { data, error } = await supabase.auth.signUp({
       email,
       password,
     });
     if (error) throw error;
     return data;
   };

   // Sign in
   const signIn = async (email, password) => {
     const { data, error } = await supabase.auth.signInWithPassword({
       email,
       password,
     });
     if (error) throw error;
     return data;
   };

   // Sign out
   const signOut = async () => {
     const { error } = await supabase.auth.signOut();
     if (error) throw error;
   };
   ```

2. Create an auth context to manage user state throughout your app:

   ```typescript
   // src/contexts/AuthContext.tsx
   import { createContext, useContext, useEffect, useState } from 'react';
   import { supabase } from '../utils/supabaseClient';

   const AuthContext = createContext();

   export const AuthProvider = ({ children }) => {
     const [user, setUser] = useState(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
       // Check active sessions and sets the user
       const getUser = async () => {
         const { data: { session } } = await supabase.auth.getSession();
         setUser(session?.user ?? null);
         setLoading(false);
       };

       getUser();

       // Listen for auth changes
       const { data: { subscription } } = supabase.auth.onAuthStateChange(
         (_event, session) => {
           setUser(session?.user ?? null);
           setLoading(false);
         }
       );

       return () => subscription.unsubscribe();
     }, []);

     return (
       <AuthContext.Provider value={{ user, loading }}>
         {children}
       </AuthContext.Provider>
     );
   };

   export const useAuth = () => useContext(AuthContext);
   ```

3. Wrap your app with the AuthProvider:

   ```typescript
   // src/main.tsx
   import { AuthProvider } from './contexts/AuthContext';

   ReactDOM.render(
     <React.StrictMode>
       <AuthProvider>
         <App />
       </AuthProvider>
     </React.StrictMode>,
     document.getElementById('root')
   );
   ```

## Part 5: Testing Your Deployment

1. After deploying, test user registration and login
2. Verify that data operations are working correctly
3. Test all major features of your application

## Part 6: Maintenance and Monitoring

1. Set up monitoring in Supabase to track usage and performance
2. Regularly back up your database
3. Keep dependencies updated
4. Monitor error logs in both Vercel and Supabase

---

## Important Notes

1. The default admin user has username `admin` and password `admin123`. **Change this password immediately after your first login!**

2. This deployment guide assumes you're using the existing codebase with minimal changes. If you've made significant changes to the application architecture, you may need to adjust these instructions accordingly.

3. For production deployments, always use environment variables and never hardcode sensitive information like API keys.

4. Ensure proper security practices are followed, including setting up appropriate Row Level Security policies in Supabase.