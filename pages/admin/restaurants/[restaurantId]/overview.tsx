import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../../../styles/Layout.module.css';
import { supabase } from '../../../../utils/supabaseClient';

// Define types
interface InventoryRequest {
  id: string;
  restaurant_id: string;
  item_id: string;
  quantity: number;
  unit: string;
  timeline: string;
  notes: string;
  status: string;
  called_driver: boolean;
}

interface Driver {
  id: string;
  name: string;
  contact_info: string;
}

const Overview = () => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const [activeTab, setActiveTab] = useState('pending');
  const [pendingOrders, setPendingOrders] = useState<InventoryRequest[]>([]);
  const [pastOrders, setPastOrders] = useState<InventoryRequest[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<InventoryRequest[]>([]);
  const [restaurants, setRestaurants] = useState<Record<string, string>>({});
  const [items, setItems] = useState<Record<string, string>>({});
  const [newOrderNotification, setNewOrderNotification] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurants
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*');
        if (restaurantError) throw restaurantError;

        const restaurantMap = (restaurantData || []).reduce((acc, restaurant) => {
          acc[restaurant.id] = restaurant.name;
          return acc;
        }, {} as Record<string, string>);
        setRestaurants(restaurantMap);

        // Fetch items
        const { data: itemData, error: itemError } = await supabase
          .from('items')
          .select('*');
        if (itemError) throw itemError;

        const itemMap = (itemData || []).reduce((acc, item) => {
          acc[item.id] = item.name;
          return acc;
        }, {} as Record<string, string>);
        setItems(itemMap);

        // Fetch pending orders
        const { data: pendingData, error: pendingError } = await supabase
          .from('inventory_requests')
          .select('*')
          .eq('status', 'pending');
        if (pendingError) throw pendingError;
        setPendingOrders(pendingData || []);

        // Fetch accepted orders
        const { data: acceptedData, error: acceptedError } = await supabase
          .from('inventory_requests')
          .select('*')
          .eq('status', 'accepted')
          .eq('called_driver', false);
        if (acceptedError) throw acceptedError;
        setAcceptedOrders(acceptedData || []);

        // Fetch past orders
        const { data: pastData, error: pastError } = await supabase
          .from('inventory_requests')
          .select('*')
          .eq('status', 'accepted')
          .eq('called_driver', true);
        if (pastError) throw pastError;
        setPastOrders(pastData || []);

        // Fetch drivers
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*');
        if (driverError) throw driverError;
        setDrivers(driverData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const channel = supabase
    .channel('public:inventory_requests')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'inventory_requests' },
      (payload) => {
        if (payload.new && validateInventoryRequest(payload.new)) {
          setPendingOrders((prev) => [...prev, payload.new as InventoryRequest]); // Type assertion here
          setNewOrderNotification(true);
  
          setTimeout(() => {
            setNewOrderNotification(false);
          }, 5000);
        } else {
          console.error('Invalid data format received:', payload.new);
        }
      }
    )
    .subscribe();
  

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const validateInventoryRequest = (data: any): data is InventoryRequest => {
    return (
      typeof data.id === 'string' &&
      typeof data.restaurant_id === 'string' &&
      typeof data.item_id === 'string' &&
      typeof data.quantity === 'number' &&
      typeof data.unit === 'string' &&
      typeof data.timeline === 'string' &&
      typeof data.notes === 'string' &&
      typeof data.status === 'string' &&
      typeof data.called_driver === 'boolean'
    );
  };

  const handleNotificationClick = () => {
    setNewOrderNotification(false);
    setActiveTab('pending');
  };

  const handleAcceptOrder = async (orderId: string) => {
    const order = pendingOrders.find((o) => o.id === orderId);
    if (!order) return;

    try {
      const { error } = await supabase
        .from('inventory_requests')
        .update({ status: 'accepted' })
        .eq('id', orderId);
      if (error) throw error;

      setPendingOrders(pendingOrders.filter((o) => o.id !== orderId));
      setAcceptedOrders([...acceptedOrders, { ...order, status: 'accepted', called_driver: false }]);
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const order = pendingOrders.find((o) => o.id === orderId);
    if (!order) return;

    try {
      const { error } = await supabase
        .from('inventory_requests')
        .update({ status: 'rejected' })
        .eq('id', orderId);
      if (error) throw error;

      setPendingOrders(pendingOrders.filter((o) => o.id !== orderId));
      setPastOrders([...pastOrders, { ...order, status: 'rejected' }]);
    } catch (error) {
      console.error('Error rejecting order:', error);
    }
  };

  const handleCallAllDrivers = async (orderId: string) => {
    setLoadingOrderId(orderId);

    const order = acceptedOrders.find((o) => o.id === orderId);
    if (!order) return;

    try {
      const { error } = await supabase
        .from('inventory_requests')
        .update({ called_driver: true })
        .eq('id', orderId);
      if (error) throw error;

      for (const driver of drivers) {
        try {
          const response = await fetch('/api/sendSMS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: driver.contact_info,
              message: `New order is available. Check your dashboard.`,
            }),
          });

          if (!response.ok) {
            console.error(`Error sending SMS to ${driver.name}`);
          }
        } catch (err) {
          console.error(`Error sending SMS to ${driver.name}:`, err);
        }
      }

      setAcceptedOrders(acceptedOrders.filter((o) => o.id !== orderId));
      setPastOrders([...pastOrders, { ...order, called_driver: true }]);
    } catch (error) {
      console.error('Error calling drivers:', error);
    } finally {
      setLoadingOrderId(null);
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
          <button onClick={() => setNewOrderNotification(false)} className={styles.closeButton}>
            ×
          </button>
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
