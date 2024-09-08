// pages/admin/restaurants/[restaurantId]/driversManagement.tsx
import React, { useState } from 'react';
import BackButton from '../../../../components/BackButton';
import styles from '../../../../styles/DriversManagement.module.css';

interface Driver {
  id: number;
  name: string;
  schedule: string;
  capacity: number;
  phone: string;
  email: string;
  orders: Order[];
}

interface Order {
  orderId: number;
  customerName: string;
  orderAmount: number;
  paymentStatus: 'Pending' | 'Paid';
}

const DriversManagement = () => {
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: 1,
      name: 'John Doe',
      schedule: 'Monday to Friday',
      capacity: 10,
      phone: '123-456-7890',
      email: 'john.doe@example.com',
      orders: [
        { orderId: 101, customerName: 'Cloud Naan Northeast', orderAmount: 250, paymentStatus: 'Pending' },
        { orderId: 102, customerName: 'Cloud Naan Northeast', orderAmount: 500, paymentStatus: 'Paid' },
      ],
    },
    {
      id: 2,
      name: 'Jane Smith',
      schedule: 'Weekends',
      capacity: 5,
      phone: '987-654-3210',
      email: 'jane.smith@example.com',
      orders: [
        { orderId: 201, customerName: 'Cloud Naan Northeast', orderAmount: 300, paymentStatus: 'Paid' },
        { orderId: 202, customerName: 'Cloud Naan Northeast', orderAmount: 150, paymentStatus: 'Pending' },
      ],
    },
    {
      id: 3,
      name: 'Robert Brown',
      schedule: 'Monday to Wednesday',
      capacity: 8,
      phone: '555-555-5555',
      email: 'robert.brown@example.com',
      orders: [
        { orderId: 301, customerName: 'Cloud Naan Northeast', orderAmount: 450, paymentStatus: 'Paid' },
        { orderId: 302, customerName: 'Cloud Naan Northeast', orderAmount: 250, paymentStatus: 'Pending' },
      ],
    },
    {
      id: 4,
      name: 'Lisa White',
      schedule: 'Tuesday and Thursday',
      capacity: 12,
      phone: '222-222-2222',
      email: 'lisa.white@example.com',
      orders: [
        { orderId: 401, customerName: 'Cloud Naan Northeast', orderAmount: 600, paymentStatus: 'Paid' },
        { orderId: 402, customerName: 'Cloud Naan Northeast', orderAmount: 200, paymentStatus: 'Pending' },
      ],
    },
    {
      id: 5,
      name: 'Michael Green',
      schedule: 'Wednesday to Sunday',
      capacity: 15,
      phone: '333-333-3333',
      email: 'michael.green@example.com',
      orders: [
        { orderId: 501, customerName: 'Cloud Naan Northeast', orderAmount: 700, paymentStatus: 'Paid' },
        { orderId: 502, customerName: 'Cloud Naan Northeast', orderAmount: 350, paymentStatus: 'Pending' },
      ],
    },
  ]);

  const [newDriver, setNewDriver] = useState<Partial<Driver>>({
    name: '',
    schedule: '',
    capacity: 0,
    phone: '',
    email: '',
    orders: [],
  });

  const handleAddDriver = () => {
    if (newDriver.name && newDriver.phone) {
      const newDriverWithId = { ...newDriver, id: drivers.length + 1, orders: [] } as Driver;
      setDrivers([...drivers, newDriverWithId]);
      setNewDriver({ name: '', schedule: '', capacity: 0, phone: '', email: '', orders: [] });
    }
  };

  const handleEditDriver = (id: number) => {
    const updatedDrivers = drivers.map((driver) =>
      driver.id === id ? { ...driver, ...newDriver } : driver
    );
    setDrivers(updatedDrivers);
  };

  const handleRemoveDriver = (id: number) => {
    setDrivers(drivers.filter((driver) => driver.id !== id));
  };

  return (
    <div className={styles.container}>
      <BackButton />
      <h1>Billing Management (Drivers)</h1>

      {/* Add Driver Form */}
      <div className={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={newDriver.name}
          onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Schedule"
          value={newDriver.schedule}
          onChange={(e) => setNewDriver({ ...newDriver, schedule: e.target.value })}
        />
        <input
          type="number"
          placeholder="Capacity"
          value={newDriver.capacity || 0}
          onChange={(e) => setNewDriver({ ...newDriver, capacity: parseInt(e.target.value) })}
        />
        <input
          type="text"
          placeholder="Phone"
          value={newDriver.phone}
          onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newDriver.email}
          onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
        />
        <button onClick={handleAddDriver}>Add Driver</button>
      </div>

      {/* Manage Drivers Table */}
      <h2>Manage Drivers</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Schedule</th>
            <th>Capacity</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr key={driver.id}>
              <td>{driver.name}</td>
              <td>{driver.schedule}</td>
              <td>{driver.capacity}</td>
              <td>{driver.phone}</td>
              <td>{driver.email}</td>
              <td>
                <button onClick={() => handleEditDriver(driver.id)}>Edit</button>
                <button onClick={() => handleRemoveDriver(driver.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Driver Orders Section */}
      <h2>Driver Orders</h2>
      {drivers.map((driver) => (
        <div key={driver.id} className={styles.driverOrders}>
          <h3>{driver.name}'s Orders</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Order Amount</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {driver.orders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.customerName}</td>
                  <td>${order.orderAmount.toFixed(2)}</td>
                  <td>{order.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default DriversManagement;
