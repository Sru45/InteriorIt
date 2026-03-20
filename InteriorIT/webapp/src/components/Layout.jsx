import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FilePlus, History as HistoryIcon, Settings, LogOut } from 'lucide-react';

export default function Layout({ children, setAuth }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    if (setAuth) setAuth(false);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'New Estimate', path: '/create-estimate', icon: <FilePlus size={20} /> },
    { name: 'History', path: '/history', icon: <HistoryIcon size={20} /> },
    { name: 'Settings', path: '/profile', icon: <Settings size={20} /> }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#fff', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '18px', lineHeight: '1.2' }}>INTERIOR</div>
            <div style={{ fontSize: '12px', color: '#888', letterSpacing: '2px' }}>I T</div>
          </div>
        </div>

        <div style={{ padding: '12px', flex: 1 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith('/edit-estimate') && item.name === 'History');
            return (
              <div 
                key={item.name}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                  backgroundColor: isActive ? '#BC1F24' : 'transparent',
                  color: isActive ? '#fff' : '#666',
                  fontWeight: isActive ? '500' : 'normal',
                  marginBottom: '8px',
                  transition: 'all 0.2s'
                }}
              >
                {React.cloneElement(item.icon, { color: isActive ? '#fff' : '#666' })}
                {item.name}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '24px' }}>
          <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#666', cursor: 'pointer', padding: '12px 16px' }}>
            <LogOut size={20} color="#666" />
            Logout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '40px 48px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
