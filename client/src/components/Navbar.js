import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <nav style={{
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', height: 60, justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
            boxShadow: '0 0 20px var(--accent-glow)'
          }}>⚡</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>
            Memento
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[
            { path: '/dashboard', label: 'Decks', icon: '📚' },
            { path: '/generate', label: 'Generate', icon: '✨' },
          ].map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                color: isActive(path) ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive(path) ? 'var(--bg-elevated)' : 'transparent',
                transition: 'var(--transition)',
              }}
            >
              <span>{icon}</span> {label}
            </Link>
          ))}
        </div>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '6px 12px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            <div style={{
              width: 28, height: 28,
              background: 'var(--accent)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
            }}>{initials}</div>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{user?.name?.split(' ')[0]}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>▼</span>
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 8,
              minWidth: 180,
              boxShadow: 'var(--shadow)',
              animation: 'fadeIn 0.15s ease',
              zIndex: 200,
            }}>
              <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{user?.email}</div>
              </div>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'transparent',
                  color: 'var(--red)',
                  fontSize: 14,
                  display: 'flex', alignItems: 'center', gap: 8,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => e.target.style.background = 'var(--red-soft)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                🚪 Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {menuOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </nav>
  );
}
