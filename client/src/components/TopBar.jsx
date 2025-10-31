import React, { useState } from 'react';
import { FiSearch, FiBell, FiMenu, FiX, FiChevronDown } from 'react-icons/fi';

const TopBar = ({ toggleSidebar, isSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <header className="top-bar">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 text-gray-600 hover:text-gray-800 lg:hidden transition-colors duration-200 p-2 rounded-lg hover:bg-white/20"
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <h1 className="page-title text-gray-800">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 placeholder-gray-500"
            placeholder="Search transactions..."
          />
        </form>

        <button className="p-2 text-gray-600 hover:text-gray-800 relative transition-colors duration-200 rounded-lg hover:bg-white/20">
          <FiBell size={20} />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
        </button>

        <div className="relative">
          <button
            className="flex items-center space-x-2 focus:outline-none p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center font-medium shadow-md">
              U
            </div>
            <span className="hidden md:inline text-sm font-medium text-gray-700">User</span>
            <FiChevronDown className={`text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-card py-1 z-50 animate-in slide-in-from-top-2 duration-200">
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20 transition-colors duration-200"
              >
                Your Profile
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-white/20 transition-colors duration-200"
              >
                Settings
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                Sign out
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
