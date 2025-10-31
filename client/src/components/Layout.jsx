import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      // Automatically show/hide sidebar based on screen size
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} />
      <div 
        className={`main-content transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'lg:ml-[250px]' : 'lg:ml-0'
        }`}
      >
        <TopBar 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
        <div className="container mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
