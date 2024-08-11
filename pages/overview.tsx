// src/pages/overview.tsx

import React, { useState } from 'react';
import styles from '../components/Layout.module.css';

const initialRestaurants = [
  { id: 'A', name: 'Restaurant A', currentInventory: 100, expectedDemand: 50, requestedInventory: 80, timeline: '2 days', notes: 'Check with supplier' },
  { id: 'B', name: 'Restaurant B', currentInventory: 80, expectedDemand: 60, requestedInventory: 70, timeline: '3 days', notes: 'Urgent' },
  { id: 'C', name: 'Restaurant C', currentInventory: 90, expectedDemand: 55, requestedInventory: 75, timeline: '1 day', notes: 'Pending approval' },
  { id: 'D', name: 'Restaurant D', currentInventory: 110, expectedDemand: 65, requestedInventory: 85, timeline: '4 days', notes: 'Requires confirmation' },
  { id: 'E', name: 'Restaurant E', currentInventory: 95, expectedDemand: 70, requestedInventory: 90, timeline: '5 days', notes: 'Need follow-up' },
];

const Overview = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingOrders, setPendingOrders] = useState(initialRestaurants);
  const [pastOrders, setPastOrders] = useState([]);

  const handleAcceptOrder = (restaurantId) => {
    const acceptedOrder = pendingOrders.find(order => order.id === restaurantId);
    setPendingOrders(pendingOrders.filter(order => order.id !== restaurantId));
    setPastOrders([...pastOrders, { ...acceptedOrder, status: 'Accepted' }]);
  };

  const handleRejectOrder = (restaurantId) => {
    const rejectedOrder = pendingOrders.find(order => order.id === restaurantId);
    setPendingOrders(pendingOrders.filter(order => order.id !== restaurantId));
    setPastOrders([...pastOrders, { ...rejectedOrder, status: 'Rejected' }]);
  };

  return (
    <div className={styles.overview}>
      <h1>Overview</h1>
      <div className={styles.tabButtons}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'pending' ? styles.activeTab : ''}`} 
          onClick={() => setActiveTab('pending')}
        >
          Pending Orders
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'past' ? styles.activeTab : ''}`} 
          onClick={() => setActiveTab('past')}
        >
          Past Orders
        </button>
      </div>

      {activeTab === 'pending' && (
        <>
          <h2>Pending Orders</h2>
          <div className={styles.restaurants}>
            {pendingOrders.length > 0 ? (
              pendingOrders.map((restaurant) => (
                <div key={restaurant.id} className={styles.restaurant}>
                  <h3>{restaurant.name}</h3>
                  <div className={styles.restaurantDetails}>
                    <p><strong>Current inventory:</strong> {restaurant.currentInventory}</p>
                    <p><strong>Expected demand:</strong> {restaurant.expectedDemand}</p>
                    <p><strong>Requested Inventory:</strong> {restaurant.requestedInventory}</p>
                    <p><strong>Timeline:</strong> {restaurant.timeline}</p>
                    <p><strong>Notes:</strong> {restaurant.notes}</p>
                    <div className={styles.buttons}>
                      <button className={styles.acceptButton} onClick={() => handleAcceptOrder(restaurant.id)}>Accept Order</button>
                      <button className={styles.rejectButton} onClick={() => handleRejectOrder(restaurant.id)}>Reject Order</button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending orders.</p>
            )}
          </div>
        </>
      )}

      {activeTab === 'past' && (
        <>
          <h2>Past Orders</h2>
          <div className={styles.restaurants}>
            {pastOrders.length > 0 ? (
              pastOrders.map((restaurant) => (
                <div key={restaurant.id} className={styles.restaurant}>
                  <h3>{restaurant.name} - {restaurant.status}</h3>
                  <div className={styles.restaurantDetails}>
                    <p><strong>Current inventory:</strong> {restaurant.currentInventory}</p>
                    <p><strong>Expected demand:</strong> {restaurant.expectedDemand}</p>
                    <p><strong>Requested Inventory:</strong> {restaurant.requestedInventory}</p>
                    <p><strong>Timeline:</strong> {restaurant.timeline}</p>
                    <p><strong>Notes:</strong> {restaurant.notes}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No past orders.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
