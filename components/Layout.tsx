import React, { useState } from 'react';
import Sidebar from './Sidebar';
import styles from '../styles/Layout.module.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.layoutContainer}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <main className={`${styles.mainContent} ${isSidebarOpen ? styles.contentShift : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
