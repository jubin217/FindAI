import React, { useState, useEffect } from 'react';
import { Search, Plus, GitCompare, LogIn, User, LogOut, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  onSubmitClick: () => void;
  onCompareClick: () => void;
  compareCount: number;
  user: any;
  onLoginClick: () => void;
  onSignOutClick: () => void;
  currentView: 'home' | 'submit-tool' | 'profile' | 'admin';
  onNavigate: (view: 'home' | 'submit-tool' | 'profile' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeToggle,
  searchValue,
  onSearchChange,
  onSubmitClick,
  onCompareClick,
  compareCount,
  user,
  onLoginClick,
  onSignOutClick,
  currentView,
  onNavigate
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide
        setVisible(false);
      } else {
        // Scrolling up - show
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getInitials = () => {
    if (!user) return '??';
    if (user.user_metadata?.name) {
      return user.user_metadata.name
        .split(' ')
        .slice(0, 2)
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    return user.email?.substring(0, 2).toUpperCase() || 'US';
  };

  return (
    <header className={`header ${visible ? '' : 'header-hidden'}`}>
      <div className="container header-container" style={{ maxWidth: '1400px' }}>
        {/* Brand Logo */}
        <a 
          href="/" 
          className="logo-wrapper"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('home');
          }}
        >
          <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img 
              src="/logoonly-removebg.webp" 
              alt="FindAI Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain'
              }} 
            />
          </div>
          <span className="logo-text">FindAI<span className="logo-suffix">.store</span></span>
        </a>

        {/* Global Search Bar (Only display when on Home View) */}
        {currentView === 'home' ? (
          <div className="header-search">
            <Search size={18} className="text-muted" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search AI tools..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        {/* Actions & Connections */}
        <div className="header-nav" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Theme Toggle Button */}
          <button 
            onClick={onThemeToggle} 
            className="theme-toggle-btn btn-3d"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.3s ease, background 0.2s',
              padding: 0
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>


          {/* Comparison trigger */}
          {compareCount > 0 && currentView === 'home' && (
            <button className="nav-link" onClick={onCompareClick} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <GitCompare size={18} />
              <span className="nav-text-desktop">Compare </span><span>({compareCount})</span>
            </button>
          )}

          {/* Dynamic User Profile Navigation */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="profile-btn"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: 'white',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {getInitials()}
              </button>

              {showDropdown && (
                <>
                  {/* Backdrop trigger */}
                  <div 
                    onClick={() => setShowDropdown(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
                  />
                  
                  {/* Dropdown Menu */}
                  <div className="glass-panel profile-dropdown neon-border">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar-small">
                        {getInitials()}
                      </div>
                      <div className="dropdown-user-details">
                        <span className="dropdown-user-label">Logged In</span>
                        <span className="dropdown-user-email" title={user.email}>{user.email}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => { onNavigate('profile'); setShowDropdown(false); }}
                      className="dropdown-btn"
                    >
                      <User size={15} />
                      <span>My Profile</span>
                    </button>

                    <button 
                      onClick={() => { onNavigate('submit-tool'); setShowDropdown(false); }}
                      className="dropdown-btn"
                    >
                      <Plus size={15} />
                      <span>Submit a Tool</span>
                    </button>

                    <button 
                      onClick={() => { onSignOutClick(); setShowDropdown(false); }}
                      className="dropdown-btn-danger"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Sign In CTA */}
              <button 
                className="nav-link" 
                onClick={onLoginClick}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>

              {/* Submit CTA */}
              <button 
                className="btn-primary" 
                onClick={onSubmitClick} 
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Plus size={16} />
                <span className="nav-text-desktop">Submit Tool</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
