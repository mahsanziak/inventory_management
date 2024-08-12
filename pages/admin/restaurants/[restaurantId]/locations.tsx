// src/pages/admin/restaurants/[restaurantId]/locations.tsx

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../../utils/supabaseClient';
import styles from '../../../../styles/Layout.module.css';
import dynamic from 'next/dynamic';

// Dynamically import html2pdf.js for client-side use only
const html2pdf = dynamic(() => import('html2pdf.js'), { ssr: false });

const Locations = () => {
  const router = useRouter();
  const { restaurantId } = router.query;

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [acceptedOrders, setAcceptedOrders] = useState({});
  const [invoices, setInvoices] = useState([]);
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
        setLocations(data);
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

  const fetchAcceptedOrdersAndInvoices = async (locationId) => {
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
        const orderMonth = orderDate.getMonth() + 1; // JavaScript months are 0-based
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
      }, {});
      setAcceptedOrders(groupedOrders);
    }

    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('restaurant_id', locationId);

    if (invoiceError) {
      console.error('Error fetching invoices:', invoiceError);
    } else {
      setInvoices(invoiceData);
    }
  };

  const handleLocationChange = (locationId) => {
    setSelectedLocation(locationId);
    fetchAcceptedOrdersAndInvoices(locationId);
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    if (selectedLocation) {
      fetchAcceptedOrdersAndInvoices(selectedLocation);
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    if (selectedLocation) {
      fetchAcceptedOrdersAndInvoices(selectedLocation);
    }
  };

  const handlePrint = () => {
    const invoice = document.getElementById('invoiceTemplate');
    if (invoice && html2pdf) {
      html2pdf().from(invoice).save();
    }
  };

  return (
    <div className={styles.locationsContainer}>
      <h1>Locations</h1>
      <select onChange={(e) => handleLocationChange(e.target.value)} value={selectedLocation || ''}>
        <option value="" disabled>Select a location</option>
        {locations.map(location => (
          <option key={location.id} value={location.id}>{location.name}</option>
        ))}
      </select>

      <select onChange={(e) => handleMonthChange(e.target.value)} value={selectedMonth}>
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

      <select onChange={(e) => handleYearChange(e.target.value)} value={selectedYear}>
        <option value="All">All</option>
        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
          <option key={year} value={year}>{year}</option>
        ))}
      </select>
      <button onClick={() => fetchAcceptedOrdersAndInvoices(selectedLocation)}>Filter</button>

      {selectedLocation && (
        <div className={styles.locationDetails}>
          <h2>{locations.find(loc => loc.id === selectedLocation)?.name}</h2>

          {/* Accepted Orders Section */}
          <h3>Accepted Orders by Billing Period</h3>
          {Object.keys(acceptedOrders).length > 0 ? (
            Object.keys(acceptedOrders).map((period) => (
              <div key={period}>
                <h4>Billing Period: {period}</h4>
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
                  <tfoot>
                    <tr>
                      <td colSpan="3"><strong>Subtotal</strong></td>
                      <td colSpan="2">
                        <strong>
                          ${acceptedOrders[period].reduce((acc, order) => acc + (order.quantity * order.items.cost_per_unit), 0).toFixed(2)}
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))
          ) : (
            <p>No accepted orders.</p>
          )}

          {/* Invoices Section */}
          <h3>Invoices</h3>
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

          <button onClick={handlePrint} className={styles.printButton}>Print Invoice</button>

          {/* Hidden Invoice Template */}
          <div id="invoiceTemplate" style={{ display: 'none' }}>
            <h1>Invoice</h1>
            <p><strong>Restaurant Name:</strong> {locations.find(loc => loc.id === selectedLocation)?.name}</p>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Rate</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(acceptedOrders).map((period) => (
                  acceptedOrders[period].map((order, index) => (
                    <tr key={index}>
                      <td>{order.items.name}</td>
                      <td>${order.items.cost_per_unit.toFixed(2)}</td>
                      <td>{order.quantity}</td>
                      <td>${(order.quantity * order.items.cost_per_unit).toFixed(2)}</td>
                    </tr>
                  ))
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>Subtotal</strong></td>
                  <td>
                    <strong>
                      ${Object.keys(acceptedOrders).reduce((acc, period) => {
                        return acc + acceptedOrders[period].reduce((periodAcc, order) => periodAcc + (order.quantity * order.items.cost_per_unit), 0);
                      }, 0).toFixed(2)}
                    </strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;

