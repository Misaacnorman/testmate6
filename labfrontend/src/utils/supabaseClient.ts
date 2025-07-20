import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are available
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// Create supabase client if configured, otherwise create a mock client with localStorage
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createLocalStorageFallback();

// Helper function for error handling
export const handleError = (error: unknown) => {
  console.error('API Error:', error);
  if (error instanceof Error) {
    throw new Error(error.message);
  }
  throw new Error('An unknown error occurred');
};

// Function to create a fallback client using localStorage
function createLocalStorageFallback() {
  console.warn('Supabase environment variables are missing. Using localStorage fallback for development.');
  
  // Create unique IDs for new records
  const generateUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Return a mock client that uses localStorage
  return {
    auth: {
      signIn: ({ email, password }) => {
        // Simulate user authentication
        const users = JSON.parse(localStorage.getItem('testmate_users') || '[]');
        const user = users.find(u => u.email === email);
        if (user && password === 'password') { // Simple password check for demo
          localStorage.setItem('testmate_current_user', JSON.stringify(user));
          return Promise.resolve({ data: { user }, error: null });
        }
        return Promise.resolve({ data: { user: null }, error: { message: 'Invalid login credentials' } });
      },
      signUp: ({ email, password }) => {
        const users = JSON.parse(localStorage.getItem('testmate_users') || '[]');
        const newUser = { id: generateUuid(), email, created_at: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem('testmate_users', JSON.stringify(users));
        localStorage.setItem('testmate_current_user', JSON.stringify(newUser));
        return Promise.resolve({ data: { user: newUser }, error: null });
      },
      signOut: () => {
        localStorage.removeItem('testmate_current_user');
        return Promise.resolve({ error: null });
      },
      onAuthStateChange: (callback) => {
        // No-op for now
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getSession: () => {
        const user = JSON.parse(localStorage.getItem('testmate_current_user') || 'null');
        return Promise.resolve({ 
          data: { session: user ? { user } : null },
          error: null
        });
      },
      getUser: () => {
        const user = JSON.parse(localStorage.getItem('testmate_current_user') || 'null');
        return Promise.resolve({
          data: { user },
          error: null
        });
      }
    },
    from: (table) => ({
      select: (columns) => ({
        eq: (column, value) => {
          const items = JSON.parse(localStorage.getItem(`testmate_${table}`) || '[]');
          const filteredItems = items.filter(item => item[column] === value);
          return Promise.resolve({
            data: filteredItems,
            error: null
          });
        },
        order: () => ({
          limit: () => Promise.resolve({
            data: JSON.parse(localStorage.getItem(`testmate_${table}`) || '[]'),
            error: null
          })
        }),
        then: (callback) => {
          const data = JSON.parse(localStorage.getItem(`testmate_${table}`) || '[]');
          return Promise.resolve(callback({ data, error: null }));
        }
      }),
      insert: (data) => {
        const items = JSON.parse(localStorage.getItem(`testmate_${table}`) || '[]');
        const newItems = Array.isArray(data) ? data : [data];
        newItems.forEach(item => {
          if (!item.id) item.id = generateUuid();
          items.push(item);
        });
        localStorage.setItem(`testmate_${table}`, JSON.stringify(items));
        return Promise.resolve({ data: newItems, error: null });
      },
      update: (data) => ({
        eq: (column, value) => {
          const items = JSON.parse(localStorage.getItem(`testmate_${table}`) || '[]');
          const updatedItems = items.map(item => {
            if (item[column] === value) {
              return { ...item, ...data };
            }
            return item;
          });
          localStorage.setItem(`testmate_${table}`, JSON.stringify(updatedItems));
          return Promise.resolve({ 
            data: updatedItems.filter(item => item[column] === value),
            error: null 
          });
        }
      }),
      delete: () => ({
        eq: (column, value) => {
          const items = JSON.parse(localStorage.getItem(`testmate_${table}`) || '[]');
          const remainingItems = items.filter(item => item[column] !== value);
          localStorage.setItem(`testmate_${table}`, JSON.stringify(remainingItems));
          return Promise.resolve({ 
            data: null, 
            error: null 
          });
        }
      })
    }),
    storage: {
      from: (bucket) => ({
        upload: (path, file) => {
          // Simulate file storage with base64
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target.result;
              const files = JSON.parse(localStorage.getItem(`testmate_storage_${bucket}`) || '{}');
              files[path] = base64;
              localStorage.setItem(`testmate_storage_${bucket}`, JSON.stringify(files));
              resolve({ data: { path }, error: null });
            };
            reader.readAsDataURL(file);
          });
        },
        getPublicUrl: (path) => {
          const files = JSON.parse(localStorage.getItem(`testmate_storage_${bucket}`) || '{}');
          return { 
            data: { publicURL: files[path] || '' } 
          };
        }
      })
    }
  };
}