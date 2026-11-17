import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown, ListFilter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './ui/Logo';
import ThemeToggle from './ui/ThemeToggle';
import { Kbd } from './ui/Skeleton';

export default function Navbar() {
  const { isAuthenticated, username, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Ctrl+K / Cmd+K global search shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/problems?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/problems');
    }
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Problems', path: '/problems' },
    ...(isAuthenticated
      ? [
          { name: 'Submissions', path: '/submissions' },
          { name: 'Profile', path: '/profile' },
        ]
      : []),
  ];

  const userInitial = (username || 'U').charAt(0).toUpperCase();

  return (
    <header className="glass-navbar">
      <div className="container-fluid px-3 px-lg-4 d-flex align-items-center justify-content-between h-100">
        {/* Left: Logo & Nav Links */}
        <div className="d-flex align-items-center gap-4">
          <Logo to="/" size="md" />

          <nav className="d-none d-md-flex align-items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/problems'
                  ? location.pathname.startsWith('/problems')
                  : location.pathname === link.path;

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  style={{
                    position: 'relative',
                    padding: '8px 14px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: isActive ? 'var(--text)' : 'var(--muted)',
                    textDecoration: 'none',
                    transition: 'color var(--transition-fast)',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  {link.name}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-10px',
                        left: '12px',
                        right: '12px',
                        height: '2px',
                        background: 'var(--accent)',
                        borderRadius: '2px',
                        boxShadow: '0 0 8px var(--accent)',
                      }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Middle: Global Search Box (Ctrl+K) */}
        <div className="d-none d-sm-block flex-grow-1 mx-4" style={{ maxWidth: '340px' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '34px',
                padding: '0 54px 0 34px',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-sans)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                color: 'var(--text)',
                outline: 'none',
                transition: 'all var(--transition-fast)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <Kbd>Ctrl K</Kbd>
            </div>
          </form>
        </div>

        {/* Right: Actions (Theme Toggle & Auth) */}
        <div className="d-flex align-items-center gap-2">
          <ThemeToggle />

          {isAuthenticated ? (
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '4px 8px 4px 5px',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-gradient)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {userInitial}
                </div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{username}</span>
                {role === 'ADMIN' && (
                  <span
                    style={{
                      fontSize: '0.65rem',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'rgba(255, 77, 79, 0.2)',
                      color: 'var(--hard)',
                      fontWeight: 700,
                    }}
                  >
                    ADMIN
                  </span>
                )}
                <ChevronDown size={14} style={{ color: 'var(--muted)' }} />
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '200px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '6px',
                    zIndex: 1000,
                    animation: 'fadeIn 150ms ease-out',
                  }}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Signed in as</div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{username}</div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text)',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <User size={15} style={{ color: 'var(--accent)' }} />
                    Profile
                  </Link>

                  <Link
                    to="/submissions"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--text)',
                      borderRadius: 'var(--radius-sm)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <ListFilter size={15} style={{ color: 'var(--accent-2)' }} />
                    My Submissions
                  </Link>

                  <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      color: 'var(--hard)',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link
                to="/login"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text)',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                  transition: 'background var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  background: 'var(--accent-gradient)',
                  padding: '7px 16px',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                  boxShadow: 'var(--glow-accent)',
                  transition: 'opacity var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
