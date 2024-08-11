// src/components/Sidebar.tsx

import React from 'react';
import Link from 'next/link';
import styles from './Layout.module.css';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  // Placeholder data for restaurant details
  const restaurantName = 'Hakka Garden';
  const restaurantLocation = '2516 Cherokee Dr NW';

  return (
    <div className={styles['sidebar-container']}>
      <div className={`${styles.sidebar} ${!isOpen ? styles.sidebarMinimized : ''}`}>
        <div className={styles.restaurantDetails}>
          {isOpen ? (
            <>
              <div className={styles.restaurantName}>{restaurantName}</div>
              <div className={styles.restaurantLocation}>{restaurantLocation}</div>
            </>
          ) : (
            <i className="fas fa-utensils text-2xl"></i>
          )}
        </div>
        <ul className={styles.menu}>
          <li>
            <Link href="/overview" legacyBehavior>
              <div className={styles.menuItem}>
                <i className="fas fa-home"></i>
                {isOpen && <span className={styles.menuText}>Overview</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/locations" legacyBehavior>
              <div className={styles.menuItem}>
                <i className="fas fa-map-marker-alt"></i>
                {isOpen && <span className={styles.menuText}>Locations</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/financials" legacyBehavior>
              <div className={styles.menuItem}>
                <i className="fas fa-chart-pie"></i>
                {isOpen && <span className={styles.menuText}>Financials</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/billing" legacyBehavior>
              <div className={styles.menuItem}>
                <i className="fas fa-file-invoice-dollar"></i>
                {isOpen && <span className={styles.menuText}>Billing</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/settings" legacyBehavior>
              <div className={styles.menuItem}>
                <i className="fas fa-cogs"></i>
                {isOpen && <span className={styles.menuText}>Settings</span>}
              </div>
            </Link>
          </li>
          <li>
            <Link href="/recommendations" legacyBehavior>
              <div className={styles.menuItem}>
                <i className="fas fa-lightbulb"></i>
                {isOpen && <span className={styles.menuText}>Recommendations</span>}
              </div>
            </Link>
          </li>
        </ul>
      </div>
      <div className={styles.toggleButtonContainer}>
        <button onClick={toggleSidebar} className={styles.toggleButton}>
          <i className={`fas ${isOpen ? 'fa-angle-double-left' : 'fa-angle-double-right'}`}></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
