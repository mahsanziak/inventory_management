import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/Layout.module.css';
import { supabase } from '../../../../utils/supabaseClient';
import { sendSMS } from '../../../../utils/twilioClient'; // Adjust the path if needed


const Overview = () => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const [activeTab, setActiveTab] = useState('pending');
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pastOrders, setPastOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [restaurants, setRestaurants] = useState({});
  const [items, setItems] = useState({});
  const [newOrderNotification, setNewOrderNotification] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [loadingOrderId, setLoadingOrderId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
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

      const { data: pendingData, error: pendingError } = await supabase
        .from('inventory_requests')
        .select('*')
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error fetching pending orders:', pendingError);
      } else {
        setPendingOrders(pendingData);
      }

      // Fetch accepted orders that have not yet called the drivers
      const { data: acceptedData, error: acceptedError } = await supabase
        .from('inventory_requests')
        .select('*')
        .eq('status', 'accepted')
        .eq('called_driver', false);

      if (acceptedError) {
        console.error('Error fetching accepted orders:', acceptedError);
      } else {
        setAcceptedOrders(acceptedData);
      }

      // Fetch past orders where status is accepted and called_driver is true
      const { data: pastData, error: pastError } = await supabase
        .from('inventory_requests')
        .select('*')
        .eq('status', 'accepted')
        .eq('called_driver', true);

      if (pastError) {
        console.error('Error fetching past orders:', pastError);
      } else {
        setPastOrders(pastData);
      }

      // Fetch driver data
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*');

      if (driverError) {
        console.error('Error fetching drivers:', driverError);
      } else {
        setDrivers(driverData);
      }
    };

    fetchData();

    const channel = supabase
      .channel('public:inventory_requests')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'inventory_requests' }, (payload) => {
        if (payload.new.status === 'pending') {
          setPendingOrders((prevOrders) => [...prevOrders, payload.new]);
          setNewOrderNotification(true);

          setTimeout(() => {
            setNewOrderNotification(false);
          }, 5000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAcceptOrder = async (orderId: string) => {
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
        setAcceptedOrders([...acceptedOrders, { ...acceptedOrder, status: 'accepted', called_driver: false }]);
      }
    }
  };

  const handleRejectOrder = async (orderId: string) => {
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

  const handleCallAllDrivers = async (orderId: string) => {
    setLoadingOrderId(orderId);
    try {
      const selectedOrder = acceptedOrders.find((order) => order.id === orderId);
      if (!selectedOrder) {
        console.error('Order not found');
        return;
      }
  
      // Update the database to mark called_driver as true and update status to 'accepted'
      const { error: updateError } = await supabase
        .from('inventory_requests')
        .update({ called_driver: true, status: 'accepted' })
        .eq('id', orderId);
  
      if (updateError) {
        console.error('Error updating the order in the database:', updateError);
        return;
      }
  
      // Send SMS via the API route
      for (const driver of drivers) {
        try {
          const response = await fetch('/api/sendSMS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: driver.contact_info,
              message: 'Test message: You have been called for a new order.',
            }),
          });
  
          const result = await response.json();
  
          if (!response.ok) {
            console.error(`Error sending SMS to ${driver.name}:`, result.error);
          } else {
            console.log(`SMS sent to ${driver.name} at ${driver.contact_info}`);
          }
        } catch (smsError) {
          console.error(`Error sending SMS to ${driver.name}:`, smsError);
        }
      }
  
      // Move the order from accepted to past orders
      setAcceptedOrders(acceptedOrders.filter((order) => order.id !== orderId));
      setPastOrders([...pastOrders, { ...selectedOrder, called_driver: true, status: 'accepted' }]);
  
      alert('Drivers have been called for this order, and notifications have been sent.');
    } catch (error) {
      console.error('Error calling drivers:', error);
    } finally {
      setLoadingOrderId(null);
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
          className={`${styles.tabButton} ${activeTab === 'send' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('send')}
        >
          Send Order
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

      {activeTab === 'send' && (
        <>
          <h2>Accepted Orders</h2>
          <div className={styles.restaurantsScrollable}>
            {acceptedOrders.length > 0 ? (
              acceptedOrders.map((order) => (
                <div key={order.id} className={styles.restaurant}>
                  <h3>{restaurants[order.restaurant_id]}</h3>
                  <div className={styles.restaurantDetails}>
                    <p><strong>Item:</strong> {items[order.item_id]}</p>
                    <p><strong>Quantity:</strong> {order.quantity}</p>
                    <p><strong>Unit:</strong> {order.unit}</p>
                    <p><strong>Timeline:</strong> {order.timeline}</p>
                    <p><strong>Notes:</strong> {order.notes}</p>
                    <button
                      className={styles.callDriversButton}
                      onClick={() => handleCallAllDrivers(order.id)}
                      disabled={loadingOrderId === order.id}
                    >
                      {loadingOrderId === order.id ? 'Calling...' : 'Call all drivers'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No accepted orders.</p>
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
