import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../utils/supabaseClient';
import styles from '../../../../styles/Settings.module.css';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BillingManagement from './BillingManagement'; // Import the new Billing Management component

const Settings = () => {
  const [view, setView] = useState('dashboard'); // State to switch views
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', cost_per_unit: '', unit: '' });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('name', { ascending: true });
  
    if (error) {
      console.error('Error fetching items:', error);
    } else {
      setItems(data);
    }
  };

  const handleAddItem = async () => {
    const { name, cost_per_unit, unit } = newItem;

    if (name && cost_per_unit && unit) {
      const { data, error } = await supabase
        .from('items')
        .insert([{ name, cost_per_unit, unit }])
        .select('*');

      if (error) {
        console.error('Error adding item:', error);
      } else if (data && data.length > 0) {
        setItems([...items, data[0]]);
        setNewItem({ name: '', cost_per_unit: '', unit: '' });
      }
    }
  };

  const handleEditItem = (itemId) => {
    setEditingItemId(itemId);
  };

  const handleUpdateItem = async (itemId) => {
    const itemToUpdate = items.find(item => item.id === itemId);

    const { name, cost_per_unit, unit } = itemToUpdate;

    const { error } = await supabase
      .from('items')
      .update({ name, cost_per_unit, unit })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating item:', error);
    } else {
      setEditingItemId(null);
      fetchItems();
    }
  };

  const handleDeleteItem = async (itemId) => {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
    } else {
      setItems(items.filter(item => item.id !== itemId));
    }
  };

  const handleInputChange = (e, itemId) => {
    const { name, value } = e.target;
    setItems(items.map(item => (item.id === itemId ? { ...item, [name]: value } : item)));
  };

  const renderDashboard = () => (
    <div className={styles.settingsGrid}>
      <div className={styles.card} onClick={() => setView('inventory')}>
        <h2 className={styles.cardHeader}>Inventory Management</h2>
        <p className={styles.cardContent}>Manage your inventory items and costs.</p>
      </div>
      <div className={styles.card} onClick={() => alert('Box 1 clicked')}>
        <h2 className={styles.cardHeader}>Box 1</h2>
        <p className={styles.cardContent}>Additional settings option 1.</p>
      </div>
      <div className={styles.card} onClick={() => setView('billing')}>
        <h2 className={styles.cardHeader}>Billing Management</h2>
        <p className={styles.cardContent}>Handle billing and invoices.</p>
      </div>
      <div className={styles.card} onClick={() => alert('Box 2 clicked')}>
        <h2 className={styles.cardHeader}>Box 2</h2>
        <p className={styles.cardContent}>Additional settings option 2.</p>
      </div>
    </div>
  );

  const renderInventoryManagement = () => (
    <div className={styles.inventoryManagement}>
      <h1 className={styles.settingsTitle}>Inventory Management</h1>
      <div className={styles.itemForm}>
        <input
          type="text"
          className={styles.inputField}
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          type="number"
          className={styles.inputField}
          placeholder="Cost Per Unit"
          value={newItem.cost_per_unit}
          onChange={(e) => setNewItem({ ...newItem, cost_per_unit: e.target.value })}
        />
        <input
          type="text"
          className={styles.inputField}
          placeholder="Unit"
          value={newItem.unit}
          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
        />
        <button onClick={handleAddItem} className={styles.addButton}>Add Item</button>
      </div>

      <h3 className={styles.existingItemsTitle}>Existing Items</h3>
      <div className={styles.scrollableTable}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Cost Per Unit</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>
                  {editingItemId === item.id ? (
                    <input
                      type="text"
                      className={styles.inputField}
                      name="name"
                      value={item.name}
                      onChange={(e) => handleInputChange(e, item.id)}
                    />
                  ) : (
                    item.name
                  )}
                </td>
                <td>
                  {editingItemId === item.id ? (
                    <input
                      type="number"
                      className={styles.inputField}
                      name="cost_per_unit"
                      value={item.cost_per_unit}
                      onChange={(e) => handleInputChange(e, item.id)}
                    />
                  ) : (
                    item.cost_per_unit
                  )}
                </td>
                <td>
                  {editingItemId === item.id ? (
                    <input
                      type="text"
                      className={styles.inputField}
                      name="unit"
                      value={item.unit}
                      onChange={(e) => handleInputChange(e, item.id)}
                    />
                  ) : (
                    item.unit
                  )}
                </td>
                <td>
                  {editingItemId === item.id ? (
                    <>
                      <IconButton onClick={() => handleUpdateItem(item.id)}>
                        <SaveIcon style={{ fontSize: '1.5rem', color: 'green' }} />
                      </IconButton>
                      <IconButton onClick={() => setEditingItemId(null)}>
                        <CancelIcon style={{ fontSize: '1.5rem', color: 'red' }} />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton onClick={() => handleEditItem(item.id)}>
                        <EditIcon style={{ fontSize: '1.5rem', color: 'orange' }} />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteItem(item.id)}>
                        <DeleteIcon style={{ fontSize: '1.5rem', color: 'red' }} />
                      </IconButton>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => setView('dashboard')} className={styles.backButton}>Back to Settings</button>
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'inventory':
        return renderInventoryManagement();
      case 'billing':
        return <BillingManagement onBackToSettings={() => setView('dashboard')} />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className={styles.settings}>
      <div className={styles.settingsContent}>
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;
