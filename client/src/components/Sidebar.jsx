import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiPieChart, FiDollarSign, FiCreditCard, FiSettings, FiLogOut, FiCalendar, FiTrendingDown, FiPercent } from 'react-icons/fi';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { BsGraphUp } from 'react-icons/bs';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: <FiHome size={18} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FiDollarSign size={18} />, label: 'Income', path: '/income' },
    { icon: <RiExchangeDollarLine size={18} />, label: 'Expenses', path: '/expenses' },
    { icon: <FiCreditCard size={18} />, label: 'Transactions', path: '/transactions' },
    { icon: <BsGraphUp size={18} />, label: 'Reports', path: '/reports' },
    { divider: true },
    { icon: <FiPercent size={18} />, label: 'Salary Calc', path: '/salary-calculator' },
    { icon: <FiCalendar size={18} />, label: 'Subscriptions', path: '/subscriptions' },
    { icon: <FiTrendingDown size={18} />, label: 'Debt Tracker', path: '/debts' },
    { divider: true },
    { icon: <FiSettings size={18} />, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <h1>ByteBudget</h1>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto' }}>
        <ul className="sidebar-menu">
          {navItems.map((item, index) => {
            if (item.divider) {
              return <li key={`divider-${index}`} className="sidebar-divider" />;
            }
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <li key={item.path} className="sidebar-item">
                <Link
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar-circle">
            {userInitial}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.name || 'User'}</p>
            <p className="user-email">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          className="sidebar-logout-btn" 
          title="Logout"
        >
          <FiLogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
