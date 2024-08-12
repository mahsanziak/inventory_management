import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../utils/supabaseClient';

const Billing = () => {
  const [billingPeriod, setBillingPeriod] = useState('bi-weekly');
  const [restaurants, setRestaurants] = useState([]);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name');

      if (error) {
        console.error('Error fetching restaurants:', error);
      } else {
        setRestaurants(data);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data: inventoryRequests, error } = await supabase
        .from('inventory_requests')
        .select('restaurant_id, item_id, quantity, created_at')
        .eq('status', 'accepted')
        .eq('pending_status', 'confirmed')
        .gte('created_at', getBillingPeriodStartDate(billingPeriod)); // Filter by billing period start date

      if (error) {
        console.error('Error fetching inventory requests:', error);
        return;
      }

      // Fetch item data (cost_per_unit)
      const itemIds = inventoryRequests.map(request => request.item_id);
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('id, cost_per_unit')
        .in('id', itemIds);

      if (itemsError) {
        console.error('Error fetching items:', itemsError);
        return;
      }

      const itemMap = items.reduce((acc, item) => {
        acc[item.id] = item.cost_per_unit;
        return acc;
      }, {});

      const invoiceMap = restaurants.reduce((acc, restaurant) => {
        acc[restaurant.id] = { name: restaurant.name, total: 0 };
        return acc;
      }, {});

      inventoryRequests.forEach(request => {
        if (invoiceMap[request.restaurant_id]) {
          const totalCost = request.quantity * (itemMap[request.item_id] || 0);
          invoiceMap[request.restaurant_id].total += totalCost;
        }
      });

      setInvoices(Object.values(invoiceMap));
    };

    if (restaurants.length > 0) {
      fetchInvoices();
    }
  }, [billingPeriod, restaurants]);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBillingPeriod(e.target.value);
  };

  const getBillingPeriodStartDate = (period: string) => {
    const currentDate = new Date();
    switch (period) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() - 7);
        break;
      case 'bi-weekly':
        currentDate.setDate(currentDate.getDate() - 14);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() - 1);
        break;
      case 'yearly':
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        break;
      default:
        break;
    }
    return currentDate.toISOString();
  };

  return (
    <div className="billing">
      <h1>Billing</h1>
      <label htmlFor="billing-period">Select Billing Period:</label>
      <select id="billing-period" onChange={handlePeriodChange} value={billingPeriod}>
        <option value="weekly">Weekly</option>
        <option value="bi-weekly">Bi-Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
      <div className="invoices">
        {invoices.map((invoice, index) => (
          <div key={index} className="invoice">
            <h2>{invoice.name}</h2>
            <p>Invoice for the period: {billingPeriod}</p>
            <p>Total: ${invoice.total.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Billing;
