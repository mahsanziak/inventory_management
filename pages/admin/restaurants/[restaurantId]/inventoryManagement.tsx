// pages/admin/restaurants/[restaurantId]/inventoryManagement.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../utils/supabaseClient';
import { useRouter } from 'next/router';
import styles from '../../../../styles/InventoryManagement.module.css'; // Ensure the correct path

const InventoryManagement = () => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', cost_per_unit: '', unit: '' });
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from('items').select('*').order('name', { ascending: true });

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
    const itemToUpdate = items.find((item) => item.id === itemId);
    const { name, cost_per_unit, unit } = itemToUpdate;

    const { error } = await supabase.from('items').update({ name, cost_per_unit, unit }).eq('id', itemId);

    if (error) {
      console.error('Error updating item:', error);
    } else {
      setEditingItemId(null);
      fetchItems();
    }
  };

  const handleDeleteItem = async (itemId) => {
    const { error } = await supabase.from('items').delete().eq('id', itemId);

    if (error) {
      console.error('Error deleting item:', error);
    } else {
      setItems(items.filter((item) => item.id !== itemId));
    }
  };

  const handleInputChange = (e, itemId) => {
    const { name, value } = e.target;
    setItems(items.map((item) => (item.id === itemId ? { ...item, [name]: value } : item)));
  };

  const handleBackToSettings = () => {
    if (restaurantId) {
      router.push(`/admin/restaurants/${restaurantId}/settings`);
    }
  };

  return (
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
        <button onClick={handleAddItem} className={styles.addButton}>
          Add Item
        </button>
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
            {items.map((item) => (
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
                      <button onClick={() => handleUpdateItem(item.id)} className={styles.saveButton}>
                        Save
                      </button>
                      <button onClick={() => setEditingItemId(null)} className={styles.cancelButton}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditItem(item.id)} className={styles.editButton}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className={styles.deleteButton}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={handleBackToSettings} className={styles.backButton}>
        Back to Settings
      </button>
    </div>
  );
};

export default InventoryManagement;
