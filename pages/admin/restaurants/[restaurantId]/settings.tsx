// pages/admin/restaurants/[restaurantId]/index.tsx
import React from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/Settings.module.css';

const Settings = () => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const navigateTo = (path: string) => {
    if (restaurantId) {
      router.push(`/admin/restaurants/${restaurantId}/${path}`);
    }
  };

  return (
    <div className={styles.settingsGrid}>
      <div className={styles.card} onClick={() => navigateTo('inventoryManagement')}>
        <h2 className={styles.cardHeader}>Inventory Management</h2>
        <p className={styles.cardContent}>Manage your inventory items and costs.</p>
      </div>
      <div className={styles.card} onClick={() => navigateTo('cutOffTime')}>
        <h2 className={styles.cardHeader}>Set Cut-off Time</h2>
        <p className={styles.cardContent}>Set cut-off time for franchises to send their orders.</p>
      </div>
      <div className={styles.card} onClick={() => navigateTo('billingManagement')}>
        <h2 className={styles.cardHeader}>Billing Management</h2>
        <p className={styles.cardContent}>Handle billing and invoices.</p>
      </div>
      <div className={styles.card} onClick={() => navigateTo('box2')}>
        <h2 className={styles.cardHeader}>Box 2</h2>
        <p className={styles.cardContent}>Additional settings option 2.</p>
      </div>
    </div>
  );
  
};

export default Settings;
