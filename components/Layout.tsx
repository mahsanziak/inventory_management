// src/components/Layout.tsx

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

const Layout: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div
        className={styles.content}
        style={{ marginLeft: isOpen ? '250px' : '64px' }} // Dynamically adjust margin
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;
