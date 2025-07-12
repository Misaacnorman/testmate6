import './App.css'
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TestList from './pages/TestList';
import Finance from './pages/Finance';
import Register from './pages/Register';
import Logs from './pages/Logs';
import Sidebar from './components/Sidebar';
import UserManagement from './pages/UserManagement';
import Reports from './pages/Reports';
import Results from './pages/Results';
import Inventory from './pages/Inventory';
import Settings from './pages/Settings';
import Support from './pages/Support';
import RegisterSample from './pages/RegisterSample';
import UserRoleAdmin from './pages/UserRoleAdmin';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';

const NAV = [
  { key: 'dashboard', label: 'Dashboard', component: <Dashboard /> },
  { key: 'logs', label: 'Logs', component: <Logs /> },
  { key: 'register-sample', label: 'Register Sample', component: <RegisterSample /> },
  { key: 'tests', label: 'Material Tests', component: <TestList /> },
  { key: 'results', label: 'Test Results', component: <Results /> },
  { key: 'finance', label: 'Finance', component: <Finance /> },
  { key: 'inventory', label: 'Inventory', component: <Inventory /> },
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

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App
