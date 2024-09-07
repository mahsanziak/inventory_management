// pages/admin/restaurants/[restaurantId]/billingManagement.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../utils/supabaseClient';
import { useRouter } from 'next/router';
import styles from '../../../../styles/BillingManagement.module.css';

const BillingManagement = () => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      const { data, error } = await supabase.from('restaurants').select('id, name');
      if (error) {
        console.error('Error fetching branches:', error);
      } else {
        setBranches(data);
        setSelectedBranch(data[0]?.id);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      const fetchBillingSettingsAndInvoices = async () => {
        const { data: settings, error: settingsError } = await supabase
          .from('billing_settings')
          .select('*')
          .eq('restaurant_id', selectedBranch)
          .single();

        if (settingsError) {
          console.error('Error fetching billing settings:', settingsError);
        } else {
          setEmail(settings.email);
          setFrequency(settings.frequency);
        }

        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('restaurant_id', selectedBranch);

        if (invoicesError) {
          console.error('Error fetching invoices:', invoicesError);
        } else {
          setInvoices(invoices);
        }
      };

      fetchBillingSettingsAndInvoices();
    }
  }, [selectedBranch]);

  const handleSaveSettings = async () => {
    const { error } = await supabase
      .from('billing_settings')
      .upsert({
        restaurant_id: selectedBranch,
        email,
        frequency,
      });

    if (error) {
      console.error('Error saving billing settings:', error);
    } else {
      alert('Billing settings saved successfully');
    }
  };

  const handleBackToSettings = () => {
    if (restaurantId) {
      router.push(`/admin/restaurants/${restaurantId}/settings`);
    }
  };

  return (
    <div className={styles.billingManagement}>
      <h1>Billing Management</h1>

      <label htmlFor="branchSelect">Select Branch:</label>
      <select
        id="branchSelect"
        value={selectedBranch || ''}
        onChange={(e) => setSelectedBranch(e.target.value)}
      >
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>

      <div className={styles.settingsForm}>
        <label htmlFor="email">Email to Send Invoices:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="frequency">Frequency of Invoices:</label>
        <select
          id="frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
        >
          <option value="weekly">Weekly</option>
          <option value="bi-weekly">Bi-Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annually">Annually</option>
        </select>

        <button onClick={handleSaveSettings} className={styles.saveButton}>
          Save Settings
        </button>
      </div>

      <h2>Monthly Invoices</h2>
      <table className={styles.invoiceTable}>
        <thead>
          <tr>
            <th>Invoice ID</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.id}</td>
              <td>${invoice.amount.toFixed(2)}</td>
              <td>{new Date(invoice.date).toLocaleDateString()}</td>
              <td>{invoice.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleBackToSettings} className={styles.backButton}>
        Back to Settings
      </button>
    </div>
  );
};

export default BillingManagement;
