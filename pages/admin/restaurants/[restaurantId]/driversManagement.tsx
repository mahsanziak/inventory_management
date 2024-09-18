import React, { useState, useEffect } from 'react';
import BackButton from '../../../../components/BackButton';
import styles from '../../../../styles/DriversManagement.module.css';
import { supabase } from '../../../../utils/supabaseClient';

interface Driver {
  id: string;
  name: string;
  contact_info: string;
  contact_email: string;
}

const DriversManagement = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [newDriver, setNewDriver] = useState<Partial<Driver>>({
    name: '',
    contact_info: '',
    contact_email: '',
  });
  const [showDetails, setShowDetails] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      const { data, error } = await supabase.from('drivers').select('*');
      if (error) {
        console.error('Error fetching drivers:', error);
      } else {
        setDrivers(data);
      }
    };

    fetchDrivers();
  }, []);

  const handleAddDriver = async () => {
    if (newDriver.name && newDriver.contact_info && newDriver.contact_email) {
      const { data, error } = await supabase
        .from('drivers')
        .insert([{ 
          name: newDriver.name, 
          contact_info: newDriver.contact_info, 
          contact_email: newDriver.contact_email 
        }])
        .select();

      if (error) {
        console.error('Error adding driver:', error);
      } else if (data && Array.isArray(data)) {
        setDrivers([...drivers, ...data]);
        setNewDriver({ name: '', contact_info: '', contact_email: '' });
      } else {
        console.warn('Unexpected data format:', data);
      }
    }
  };

  const handleOpenEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setNewDriver(driver); // Pre-fill the fields with the current driver's data
    setShowEditModal(true);
  };

  const handleEditDriver = async () => {
    if (!selectedDriver) return;
    const updatedDriver = { 
      name: newDriver.name, 
      contact_info: newDriver.contact_info, 
      contact_email: newDriver.contact_email 
    };
    const { error } = await supabase.from('drivers').update(updatedDriver).eq('id', selectedDriver.id);

    if (error) {
      console.error('Error updating driver:', error);
    } else {
      setDrivers(drivers.map(driver => (driver.id === selectedDriver.id ? { ...driver, ...updatedDriver } : driver)));
      closeEditModal();
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setNewDriver({ name: '', contact_info: '', contact_email: '' });
  };

  const handleRemoveDriver = async (id: string) => {
    const { error } = await supabase.from('drivers').delete().eq('id', id);
    if (error) {
      console.error('Error removing driver:', error);
    } else {
      setDrivers(drivers.filter(driver => driver.id !== id));
    }
  };

  const handleViewDetails = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedDriver(null);
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1 className={styles.title}>Billing Management (Drivers)</h1>

      {/* Add Driver Form */}
      <div className={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={newDriver.name}
          onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Contact Info"
          value={newDriver.contact_info}
          onChange={e => setNewDriver({ ...newDriver, contact_info: e.target.value })}
        />
        <input
          type="email"
          placeholder="Contact Email"
          value={newDriver.contact_email}
          onChange={e => setNewDriver({ ...newDriver, contact_email: e.target.value })}
        />
        <button onClick={handleAddDriver}>Add Driver</button>
      </div>

      {/* Manage Drivers Table */}
      <h2 className={styles.subTitle}>Manage Drivers</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact Info</th>
            <th>Contact Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map(driver => (
            <tr key={driver.id}>
              <td>{driver.name}</td>
              <td>{driver.contact_info}</td>
              <td>{driver.contact_email}</td>
              <td className={styles.buttons}>
                <button className={styles.editButton} onClick={() => handleOpenEditModal(driver)}>Edit</button>
                <button className={styles.removeButton} onClick={() => handleRemoveDriver(driver.id)}>Remove</button>
                <button className={styles.detailsButton} onClick={() => handleViewDetails(driver)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Driver Edit Modal */}
      {showEditModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeIcon} onClick={closeEditModal}>&times;</button>
            <h3>Edit Driver Details</h3>
            <input
              type="text"
              placeholder="Name"
              value={newDriver.name}
              onChange={e => setNewDriver({ ...newDriver, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Contact Info"
              value={newDriver.contact_info}
              onChange={e => setNewDriver({ ...newDriver, contact_info: e.target.value })}
            />
            <input
              type="email"
              placeholder="Contact Email"
              value={newDriver.contact_email}
              onChange={e => setNewDriver({ ...newDriver, contact_email: e.target.value })}
            />
            <button className={styles.saveButton} onClick={handleEditDriver}>Save Changes</button>
          </div>
        </div>
      )}

      {/* Driver Details Modal */}
      {showDetails && selectedDriver && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button className={styles.closeIcon} onClick={closeDetails}>&times;</button>
            <h3>Orders for {selectedDriver.name}</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Order Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Hardcoded Example Orders */}
                <tr>
                  <td>101</td>
                  <td>Cloud Naan Northeast</td>
                  <td>$250.00</td>
                  <td>Pending</td>
                </tr>
                <tr>
                  <td>102</td>
                  <td>Cloud Naan Northeast</td>
                  <td>$500.00</td>
                  <td>Paid</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriversManagement;
