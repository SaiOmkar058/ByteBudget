import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiPieChart, FiDollarSign, FiCreditCard, FiSettings, FiLogOut } from 'react-icons/fi';
import { RiExchangeDollarLine } from 'react-icons/ri';
import { BsGraphUp } from 'react-icons/bs';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { icon: <FiHome size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FiDollarSign size={20} />, label: 'Income', path: '/income' },
    { icon: <RiExchangeDollarLine size={20} />, label: 'Expenses', path: '/expenses' },
    { icon: <FiCreditCard size={20} />, label: 'Transactions', path: '/transactions' },
    { icon: <BsGraphUp size={20} />, label: 'Reports', path: '/reports' },
    { icon: <FiPieChart size={20} />, label: 'Budgets', path: '/budgets' },
  ];

  return (
    <aside className="sidebar">
      <div className="px-6 mb-8">
        <h1 className="text-2xl font-bold text-white drop-shadow-lg">ByteBudget</h1>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 group ${
                  location.pathname === item.path
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                    : 'text-white/80 hover:bg-white/10 hover:text-white hover:shadow-md hover:backdrop-blur-sm'
                }`}
              >
                <span className={`mr-3 transition-transform duration-200 ${
                  location.pathname === item.path ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-6 py-4 border-t border-white/20 mt-auto backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-medium border border-white/30">
              U
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">User Name</p>
              <p className="text-xs text-white/70">user@example.com</p>
            </div>
          </div>
          <button className="text-white/70 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-white/10">
            <FiLogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
