import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { supabase } from './utils/supabaseClient';
import Dashboard from './pages/Dashboard';
import TestList from './pages/TestList';
import Register from './pages/Register';
import Logs from './pages/Logs';
import Sidebar from './components/Sidebar';
import Reports from './pages/Reports';
import Results from './pages/Results';
import Settings from './pages/Settings';
import Support from './pages/Support';
import RegisterSample from './pages/RegisterSample';
import UserRoleAdmin from './pages/UserRoleAdmin';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import { AuthContext } from './utils/authContext';
import type { UserProfile } from './utils/authContext';
import type { Session } from '@supabase/supabase-js';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', component: <Dashboard /> },
  { key: 'logs', label: 'Logs', component: <Logs /> },
  { key: 'register-sample', label: 'Register Sample', component: <RegisterSample /> },
  { key: 'tests', label: 'Material Tests', component: <TestList /> },
  { key: 'results', label: 'Test Results', component: <Results /> },
  { key: 'reports', label: 'Reports', component: <Reports /> },
  { key: 'user-admin', label: 'User Admin', icon: '👥', component: <UserRoleAdmin /> },
  { key: 'settings', label: 'Settings', component: <Settings /> },
  { key: 'support', label: 'Support', component: <Support /> },
];

function MainApp() {
  const [active, setActive] = useState('dashboard');
  const navItem = NAV.find(n => n.key === active);

  return (
    <div className="app-layout">
      <Sidebar active={active} setActive={setActive} nav={NAV} />
      <div style={{ marginLeft: 260, width: 'calc(100% - 260px)', height: '100vh', padding: 0, background: '#fff' }}>
        <div className="app-body" style={{ padding: 0, margin: 0 }}>
          <main className="app-main" style={{ padding: 0, margin: 0 }}>
            {navItem && navItem.component ? navItem.component : <div style={{color:'#888'}}>Coming soon...</div>}
          </main>
        </div>
      </div>
    </div>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      if (session?.user) {
        // Fetch user details from our database
        fetchUserDetails(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          await fetchUserDetails(session.user.id);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user details from custom User table
  const fetchUserDetails = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*, role:roleId(name)')
        .eq('auth_id', authId)
        .single();
        
      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }
      
      setUser(data as UserProfile);
    } catch (error) {
      console.error('Error in fetchUserDetails:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/*" element={
            <PrivateRoute>
              <MainApp />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
