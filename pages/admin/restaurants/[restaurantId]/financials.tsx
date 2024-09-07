import React from 'react';
import { FaBook, FaTools } from 'react-icons/fa'; // Import icons from react-icons
import styles from '../../../../styles/Financials.module.css';

const Financials: React.FC = () => {
  return (
    <div className={styles.financialsContainer}>
      <h1 className={styles.financialsTitle}>Financials Page</h1>
      <div className={styles.comingSoonBox}>
        <FaBook className={styles.icon} />
        <div>
          <h2>Integration with QuickBooks</h2>
          <p>Coming Soon...</p>
        </div>
        <FaTools className={styles.icon} />
      </div>
    </div>
  );
};

export default Financials;
