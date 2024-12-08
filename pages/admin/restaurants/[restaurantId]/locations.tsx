import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../utils/supabaseClient';
import styles from '../../../../styles/Layout.module.css';

// Define the type for a location
interface Location {
  id: string;
  name: string;
}

const Locations = () => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [acceptedOrders, setAcceptedOrders] = useState<Record<string, any[]>>({});
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');

  useEffect(() => {
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('parent_restaurant_id', restaurantId);

      if (error) {
        console.error('Error fetching locations:', error);
      } else {
        setLocations(data || []);
        if (data.length > 0) {
          setSelectedLocation(data[0].id);
          fetchAcceptedOrdersAndInvoices(data[0].id);
        }
      }
    };

    if (restaurantId) {
      fetchLocations();
    }
  }, [restaurantId]);

  const fetchAcceptedOrdersAndInvoices = async (locationId: string) => {
    const { data: orderData, error: orderError } = await supabase
      .from('inventory_requests')
      .select('*, items(name, cost_per_unit)')
      .eq('restaurant_id', locationId)
      .eq('status', 'accepted')
      .eq('pending_status', 'confirmed');

    if (orderError) {
      console.error('Error fetching orders:', orderError);
    } else {
      const filteredOrders = orderData.filter((order) => {
        const orderDate = new Date(order.created_at);
        const orderMonth = orderDate.getMonth() + 1;
        const orderYear = orderDate.getFullYear();

        return (
          (selectedMonth === 'All' || orderMonth === parseInt(selectedMonth)) &&
          (selectedYear === 'All' || orderYear === parseInt(selectedYear))
        );
      });

      const groupedOrders = filteredOrders.reduce((acc, order) => {
        const billingPeriod = order.billing_period || 'Unknown';
        if (!acc[billingPeriod]) {
          acc[billingPeriod] = [];
        }
        acc[billingPeriod].push(order);
        return acc;
      }, {} as Record<string, any[]>);
      setAcceptedOrders(groupedOrders);
    }

    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('restaurant_id', locationId);

    if (invoiceError) {
      console.error('Error fetching invoices:', invoiceError);
    } else {
      setInvoices(invoiceData || []);
    }
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
    fetchAcceptedOrdersAndInvoices(locationId);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    if (selectedLocation) {
      fetchAcceptedOrdersAndInvoices(selectedLocation);
    }
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    if (selectedLocation) {
      fetchAcceptedOrdersAndInvoices(selectedLocation);
    }
  };

  const handlePrint = () => {
    window.print(); // Use the browser's native print functionality
  };

  return (
    <div className={styles.locationsContainer}>
      <h1>Locations</h1>
      <div className={styles.filtersContainer}>
        <select
          onChange={(e) => handleLocationChange(e.target.value)}
          value={selectedLocation || ''}
          className={styles.dropdown}
        >
          <option value="" disabled>
            Select a location
          </option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => handleMonthChange(e.target.value)}
          value={selectedMonth}
          className={styles.dropdown}
        >
          <option value="All">All</option>
          <option value="1">January</option>
          <option value="2">February</option>
          <option value="3">March</option>
          <option value="4">April</option>
          <option value="5">May</option>
          <option value="6">June</option>
          <option value="7">July</option>
          <option value="8">August</option>
          <option value="9">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        <select
          onChange={(e) => handleYearChange(e.target.value)}
          value={selectedYear}
          className={styles.dropdown}
        >
          <option value="All">All</option>
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <button
          onClick={() => fetchAcceptedOrdersAndInvoices(selectedLocation!)}
          className={styles.filterButton}
        >
          Filter
        </button>
      </div>

      {selectedLocation && (
        <div className={styles.locationDetails}>
          <h2 className={styles.locationTitle}>
            {locations.find((loc) => loc.id === selectedLocation)?.name}
          </h2>

          <h3 className={styles.sectionTitle}>Accepted Orders by Billing Period</h3>
          {Object.keys(acceptedOrders).length > 0 ? (
            Object.keys(acceptedOrders).map((period) => (
              <div key={period} className={styles.billingPeriod}>
                <h4 className={styles.billingPeriodTitle}>Billing Period: {period}</h4>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit Cost</th>
                      <th>Total Cost</th>
                      <th>Date and Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {acceptedOrders[period].map((order, index) => (
                      <tr key={index}>
                        <td>{order.items.name}</td>
                        <td>{order.quantity}</td>
                        <td>${order.items.cost_per_unit.toFixed(2)}</td>
                        <td>${(order.quantity * order.items.cost_per_unit).toFixed(2)}</td>
                        <td>{new Date(order.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))
          ) : (
            <p>No accepted orders.</p>
          )}

          <h3 className={styles.sectionTitle}>Invoices</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Subtotal</th>
                <th>Due Date</th>
                <th>Last Payment</th>
                <th>Month</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice, index) => (
                <tr key={index}>
                  <td>{invoice.invoice_id}</td>
                  <td>${invoice.subtotal.toFixed(2)}</td>
                  <td>{new Date(invoice.due_date).toLocaleDateString()}</td>
                  <td>{new Date(invoice.last_payment).toLocaleDateString()}</td>
                  <td>{new Date(invoice.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={handlePrint} className={styles.printButton}>
            Print Invoice
          </button>
        </div>
      )}
    </div>
  );
};

export default Locations;
