// pages/admin/restaurants/[restaurantId]/cutOffTime.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../utils/supabaseClient';
import { useRouter } from 'next/router';
import { FaRegClock, FaCalendarAlt } from 'react-icons/fa';
import Clock from 'react-clock';
import 'react-clock/dist/Clock.css'; // Import Clock styles
import styles from '../../../../styles/CutOffTime.module.css';

const CutOffTime = () => {
  const router = useRouter();
  const { restaurantId } = router.query;
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedCutOffDay, setEditedCutOffDay] = useState('');
  const [editedCutOffTime, setEditedCutOffTime] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('items').select('*');
      if (error) {
        console.error('Error fetching items:', error);
      } else {
        setItems(data);
      }
    };

    fetchItems();
  }, []);

  // Function to convert cut_off_time string to Date object for Clock component
  const getTimeForClock = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':').map(Number);
    const updatedTime = new Date();
    updatedTime.setHours(hours, minutes);
    return updatedTime;
  };

  const handleEditClick = (item) => {
    setEditingItemId(item.id);
    setEditedCutOffDay(item.cut_off_day || '');
    setEditedCutOffTime(item.cut_off_time || '');
  };

  const handleSaveClick = async (itemId) => {
    const updates = {};
    if (editedCutOffDay !== '') {
      updates.cut_off_day = editedCutOffDay;
    }
    if (editedCutOffTime !== '') {
      updates.cut_off_time = editedCutOffTime;
    }

    const { error } = await supabase.from('items').update(updates).eq('id', itemId);
    if (error) {
      console.error('Error updating item:', error);
    } else {
      setItems(
        items.map((item) =>
          item.id === itemId
            ? { ...item, cut_off_day: editedCutOffDay, cut_off_time: editedCutOffTime }
            : item
        )
      );
      setEditingItemId(null);
    }
  };

  const handleCancelClick = () => {
    setEditingItemId(null);
    setEditedCutOffDay('');
    setEditedCutOffTime('');
  };

  const handleBackToSettings = () => {
    if (restaurantId) {
      router.push(`/admin/restaurants/${restaurantId}/settings`);
    }
  };

  return (
    <div className={styles.cutOffTimeContainer}>
      <h1 className={styles.title}>Cut-off Time Management</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Cut-off Day</th>
            <th>Cut-off Time</th>
            <th>Visual Clock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={styles.tableRow}>
              <td className={styles.itemName}>{item.name}</td>
              <td className={styles.displayValue}>
                {editingItemId === item.id ? (
                  <div className={styles.editContainer}>
                    <FaCalendarAlt className={styles.icon} />
                    <select
                      className={styles.inputField}
                      value={editedCutOffDay}
                      onChange={(e) => setEditedCutOffDay(e.target.value)}
                    >
                      <option value="">Select a day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                ) : (
                  <span>{item.cut_off_day || 'N/A'}</span>
                )}
              </td>
              <td className={styles.displayValue}>
                {editingItemId === item.id ? (
                  <div className={styles.editContainer}>
                    <FaRegClock className={styles.icon} />
                    <input
                      type="time"
                      className={styles.inputField}
                      value={editedCutOffTime}
                      onChange={(e) => setEditedCutOffTime(e.target.value)}
                    />
                  </div>
                ) : (
                  <span>{item.cut_off_time ? item.cut_off_time.substring(0, 5) : 'N/A'}</span>
                )}
              </td>
              <td>
                {item.cut_off_time ? (
                  <Clock
                    value={getTimeForClock(item.cut_off_time)}
                    className={styles.clock}
                    renderNumbers={true}
                    renderSecondHand={false} // Disable the seconds hand
                  />
                ) : (
                  <span className={styles.noClockText}>N/A</span>
                )}
              </td>
              <td>
                {editingItemId === item.id ? (
                  <>
                    <button
                      className={styles.saveButton}
                      onClick={() => handleSaveClick(item.id)}
                    >
                      Save
                    </button>
                    <button
                      className={styles.cancelButton}
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditClick(item)}
                  >
                    Edit
                  </button>
                )}
              </td>
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

export default CutOffTime;
