// components/BackButton.tsx
import React from 'react';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styles from '../styles/BackButton.module.css';

const BackButton = () => {
  const router = useRouter();
  const { restaurantId } = router.query; // Get the restaurantId from the query parameters

  const handleBack = () => {
    if (restaurantId) {
      // Push back to the settings page with the correct restaurantId
      router.push(`/admin/restaurants/${restaurantId}/settings`);
    } else {
      // Fallback route if restaurantId is not available
      router.push('/admin/restaurants');
    }
  };

  return (
    <button onClick={handleBack} className={styles.backButton}>
      <ArrowBackIcon style={{ fontSize: '1.5rem', color: '#555' }} />
      <span className={styles.backText}>Back</span>
    </button>
  );
};

export default BackButton;
