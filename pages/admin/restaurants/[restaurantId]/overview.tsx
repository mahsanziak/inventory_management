import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/Layout.module.css';
import { supabase } from '../../../../utils/supabaseClient';

const Overview = () => {
  const router = useRouter();
  const { restaurantId } = router.query; // Extract restaurantId from the URL

  const [activeTab, setActiveTab] = useState('pending');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [restaurants, setRestaurants] = useState({});
  const [items, setItems] = useState({});
  const [newOrderNotification, setNewOrderNotification] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch restaurant data
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*');

      if (restaurantError) {
        console.error('Error fetching restaurants:', restaurantError);
      } else {
        const restaurantMap = restaurantData.reduce((acc, restaurant) => {
          acc[restaurant.id] = restaurant.name;
          return acc;
        }, {});
        setRestaurants(restaurantMap);
      }

      // Fetch item data
      const { data: itemData, error: itemError } = await supabase
        .from('items')
        .select('*');

      if (itemError) {
        console.error('Error fetching items:', itemError);
      } else {
        const itemMap = itemData.reduce((acc, item) => {
          acc[item.id] = item.name;
          return acc;
        }, {});
        setItems(itemMap);
      }

      // Fetch all pending orders (status = 'pending')
      const { data: pendingData, error: pendingError } = await supabase
        .from('inventory_requests')
        .select('*')
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error fetching pending orders:', pendingError);
      } else {
        setPendingOrders(pendingData);
      }

      // Fetch all past orders (status != 'pending')
      const { data: pastData, error: pastError } = await supabase
        .from('inventory_requests')
        .select('*')
        .neq('status', 'pending');

      if (pastError) {
        console.error('Error fetching past orders:', pastError);
      } else {
        setPastOrders(pastData);
      }
    };

    fetchData();

    // Subscribe to real-time updates for new pending orders
    const channel = supabase
      .channel('public:inventory_requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inventory_requests' }, (payload) => {
        if (payload.new.status === 'pending') {
          setPendingOrders((prevOrders) => [...prevOrders, payload.new]);
          setNewOrderNotification(true);

          // Auto-hide the notification after 5 seconds
          setTimeout(() => {
            setNewOrderNotification(false);
          }, 5000);
        }
      })
      .subscribe();

    // Cleanup the subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAcceptOrder = async (orderId) => {
    const acceptedOrder = pendingOrders.find(order => order.id === orderId);
    if (acceptedOrder) {
      const { error } = await supabase
        .from('inventory_requests')
        .update({ status: 'accepted' })
        .eq('id', orderId);

      if (error) {
        console.error('Error accepting order:', error);
      } else {
        setPendingOrders(pendingOrders.filter(order => order.id !== orderId));
        setPastOrders([...pastOrders, { ...acceptedOrder, status: 'accepted' }]);
      }
    }
  };

  const handleRejectOrder = async (orderId) => {
    const rejectedOrder = pendingOrders.find(order => order.id === orderId);
    if (rejectedOrder) {
      const { error } = await supabase
        .from('inventory_requests')
        .update({ status: 'rejected' })
        .eq('id', orderId);

      if (error) {
        console.error('Error rejecting order:', error);
      } else {
        setPendingOrders(pendingOrders.filter(order => order.id !== orderId));
        setPastOrders([...pastOrders, { ...rejectedOrder, status: 'rejected' }]);
      }
    }
  };

  const handleNotificationClick = () => {
    setNewOrderNotification(false);
    if (restaurantId) {
      setActiveTab('pending');
    }
  };

  return (
    <div className={styles.overview}>
      <h1>Overview of All Orders</h1>
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

      {newOrderNotification && (
        <div className={styles.notification} onClick={handleNotificationClick}>
          <span>New order received! Click to view.</span>
          <button onClick={() => setNewOrderNotification(false)} className={styles.closeButton}>×</button>
        </div>
      )}

      {activeTab === 'pending' && (
        <>
          <h2>Pending Orders</h2>
          <div className={styles.restaurantsScrollable}>
            {pendingOrders.length > 0 ? (
              pendingOrders.map((order) => (
                <div key={order.id} className={styles.restaurant}>
                  <h3>{restaurants[order.restaurant_id]}</h3>
                  <div className={styles.restaurantDetails}>
                    <p><strong>Item:</strong> {items[order.item_id]}</p>
                    <p><strong>Quantity:</strong> {order.quantity}</p>
                    <p><strong>Unit:</strong> {order.unit}</p>
                    <p><strong>Timeline:</strong> {order.timeline}</p>
                    <p><strong>Notes:</strong> {order.notes}</p>
                    <div className={styles.buttons}>
                      <button className={styles.acceptButton} onClick={() => handleAcceptOrder(order.id)}>Accept Order</button>
                      <button className={styles.rejectButton} onClick={() => handleRejectOrder(order.id)}>Reject Order</button>
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
          <div className={styles.restaurantsScrollable}>
            {pastOrders.length > 0 ? (
              pastOrders.map((order) => (
                <div key={order.id} className={styles.restaurant}>
                  <h3>{restaurants[order.restaurant_id]} - {items[order.item_id]} - {order.status}</h3>
                  <div className={styles.restaurantDetails}>
                    <p><strong>Item:</strong> {items[order.item_id]}</p>
                    <p><strong>Quantity:</strong> {order.quantity}</p>
                    <p><strong>Unit:</strong> {order.unit}</p>
                    <p><strong>Timeline:</strong> {order.timeline}</p>
                    <p><strong>Notes:</strong> {order.notes}</p>
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
