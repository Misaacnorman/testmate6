import React from 'react';
import './Sidebar.css';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  key: string;
  label: string;
  icon?: string;
  children?: NavItem[];
}

interface SidebarProps {
  active: string;
  setActive: (key: string) => void;
  nav: NavItem[];
}

const ICONS: Record<string, string> = {
  dashboard: '🏠',
  logs: '📋',
  'register-sample': '📝',
  tests: '🔬',
  'material-rates': '💲',
  results: '📊',
  // finance and inventory icons removed
  reports: '📋',
  users: '👥',
  register: '➕',
  settings: '⚙️',
  support: '🆘',
};

const Sidebar = ({ active, setActive, nav }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">Testmate</span>
        <span className="sidebar-lims">LIMS</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {nav.map(item => (
            <React.Fragment key={item.key}>
              <li
                className={active === item.key ? 'active' : ''}
                onClick={() => setActive(item.key)}
              >
                <span className="sidebar-icon">{item.icon || ICONS[item.key] || '📁'}</span>
                <span className="sidebar-label">{item.label}</span>
              </li>
              {item.children && active === item.key && (
                <ul style={{ paddingLeft: '2.5rem' }}>
                  {item.children.map(child => (
                    <li
                      key={child.key}
                      className={active === child.key ? 'active' : ''}
                      onClick={e => { e.stopPropagation(); setActive(child.key); }}
                      style={{ fontSize: '1rem', opacity: 0.95 }}
                    >
                      <span className="sidebar-icon">{child.icon || ICONS[child.key] || '➕'}</span>
                      <span className="sidebar-label">{child.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </React.Fragment>
          ))}
        </ul>
      </nav>
      <div style={{ marginTop: 'auto', padding: '1em' }}>
        <button onClick={() => navigate('/profile')} style={{ width: '100%', marginBottom: 8 }}>
          Profile
        </button>
        <button onClick={handleLogout} style={{ width: '100%', background: '#d32f2f', color: '#fff' }}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
