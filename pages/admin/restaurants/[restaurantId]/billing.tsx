// src/pages/billing.tsx

import React, { useState } from 'react';

const restaurants = ['Restaurant A', 'Restaurant B', 'Restaurant C', 'Restaurant D', 'Restaurant E'];

const Billing = () => {
  const [billingPeriod, setBillingPeriod] = useState('bi-weekly');

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBillingPeriod(e.target.value);
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
        {restaurants.map((restaurant, index) => (
          <div key={index} className="invoice">
            <h2>{restaurant}</h2>
            <p>Invoice for the period: {billingPeriod}</p>
            <p>Total: ${(index + 1) * 100}.00</p> {/* Sample invoice amounts */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Billing;
