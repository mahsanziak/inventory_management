// src/pages/locations.tsx

import React, { useState } from 'react';

const locations = ['Restaurant A', 'Restaurant B', 'Restaurant C', 'Restaurant D', 'Restaurant E'];

const generateRandomData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    item: `Item ${i + 1}`,
    dailyInventory: Math.floor(Math.random() * 100),
    expectedDemand: Math.floor(Math.random() * 100),
    actualDemand: Math.floor(Math.random() * 100),
    rolloverInventory: Math.floor(Math.random() * 100),
  }));
};

const Locations = () => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [data, setData] = useState(generateRandomData());

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    setData(generateRandomData()); // Re-generate data for the selected location
  };

  return (
    <div className="locations">
      <h1>Locations</h1>
      <select onChange={(e) => handleLocationChange(e.target.value)} value={selectedLocation || ''}>
        <option value="" disabled>Select a location</option>
        {locations.map(location => (
          <option key={location} value={location}>{location}</option>
        ))}
      </select>
      {selectedLocation && (
        <div className="location-details">
          <h2>{selectedLocation}</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Daily Inventory</th>
                <th>Expected Demand</th>
                <th>Actual Demand</th>
                <th>Rollover Inventory</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.item}</td>
                  <td>{item.dailyInventory}</td>
                  <td>{item.expectedDemand}</td>
                  <td>{item.actualDemand}</td>
                  <td>{item.rolloverInventory}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="charts">
            <h3>Charts and Graphs</h3>
            {/* Placeholder for charts */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
