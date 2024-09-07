import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Layout.module.css';
import { supabase } from '../utils/supabaseClient';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantLocation, setRestaurantLocation] = useState('');

  useEffect(() => {
    const fetchParentRestaurant = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('name, location')
        .is('parent_restaurant_id', null)
        .eq('id', restaurantId)
        .single();

      if (error) {
        console.error('Error fetching parent restaurant:', error);
      } else {
        setRestaurantName(data?.name || 'Unknown Restaurant');
        setRestaurantLocation(data?.location || 'Unknown Location');
      }
    };

    if (restaurantId) {
      fetchParentRestaurant();
    }
  }, [restaurantId]);

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
            <Link href={`/admin/restaurants/${restaurantId}/overview`} legacyBehavior>
              <a className={styles.menuItem}>
                <i className="fas fa-home"></i>
                {isOpen && <span className={styles.menuText}>Dashboard</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href={`/admin/restaurants/${restaurantId}/locations`} legacyBehavior>
              <a className={styles.menuItem}>
                <i className="fas fa-map-marker-alt"></i>
                {isOpen && <span className={styles.menuText}>Locations</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href={`/admin/restaurants/${restaurantId}/settings`} legacyBehavior>
              <a className={styles.menuItem}>
                <i className="fas fa-cogs"></i>
                {isOpen && <span className={styles.menuText}>Settings</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href={`/admin/restaurants/${restaurantId}/financials`} legacyBehavior>
              <a className={styles.menuItem}>
                <i className="fas fa-chart-pie"></i>
                {isOpen && <span className={styles.menuText}>Financials</span>}
              </a>
            </Link>
          </li>
          <li>
            <Link href={`/admin/restaurants/${restaurantId}/recommendations`} legacyBehavior>
              <a className={styles.menuItem}>
                <i className="fas fa-lightbulb"></i>
                {isOpen && <span className={styles.menuText}>Recommendations</span>}
              </a>
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
