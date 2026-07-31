import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiBell, FiMenu, FiX, FiChevronDown, FiSun, FiMoon, FiSettings, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const TopBar = ({ toggleSidebar, isSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown-wrapper')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isProfileOpen]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/transactions?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = (path) => {
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/transactions') return 'All Transactions';
    if (path === '/expenses') return 'Expenses';
    if (path === '/expenses/add') return 'Add Expense';
    if (path === '/income') return 'Income';
    if (path === '/income/add') return 'Add Income';
    if (path === '/reports') return 'Financial Reports';
    if (path === '/settings') return 'Settings';
    if (path.includes('/expenses/edit')) return 'Edit Expense';
    if (path.includes('/income/edit')) return 'Edit Income';
    return 'ByteBudget';
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="top-bar">
      <div className="topbar-left">
        <button
          onClick={toggleSidebar}
          className="sidebar-toggle-btn"
          title="Toggle Sidebar"
        >
          {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
        <h1 className="topbar-title">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="topbar-right">
        {/* Search */}
        <form onSubmit={handleSearch} className="topbar-search-form">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon-svg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="topbar-search-input"
              placeholder="Search transactions..."
            />
          </div>
        </form>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          className="topbar-action-btn"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>


        {/* Profile Dropdown */}
        <div className="profile-dropdown-wrapper">
          <button
            className="profile-trigger"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="profile-avatar">
              {userInitial}
            </div>
            <span className="profile-name">{user?.name?.split(' ')[0] || 'User'}</span>
            <FiChevronDown className="dropdown-chevron" style={{ transform: isProfileOpen ? 'rotate(180deg)' : 'none' }} />
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown-menu">
              <Link
                to="/settings"
                className="dropdown-item"
                onClick={() => setIsProfileOpen(false)}
              >
                <FiUser style={{ marginRight: '0.5rem' }} /> Profile settings
              </Link>
              <Link
                to="/settings"
                className="dropdown-item"
                onClick={() => setIsProfileOpen(false)}
              >
                <FiSettings style={{ marginRight: '0.5rem' }} /> Budget settings
              </Link>
              <button
                onClick={handleLogout}
                className="dropdown-item danger"
                style={{ borderTop: '1px solid var(--border-color)', borderRadius: '0 0 var(--radius-md) var(--radius-md)', marginTop: '0.25rem' }}
              >
                <FiLogOut style={{ marginRight: '0.5rem' }} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;

