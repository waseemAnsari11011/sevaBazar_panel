import React, { useState } from 'react';

const DateTimeFilter = ({ orders, setFilteredOrders }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleFilter = () => {
    const filtered = orders.filter((order) => {
      const orderDateTime = new Date(order.createdAt);
      const startDateTime = startDate ? new Date(`${startDate}T${startTime || '00:00'}`) : null;
      const endDateTime = endDate ? new Date(`${endDate}T${endTime || '23:59'}`) : null;

      return (!startDateTime || orderDateTime >= startDateTime) && (!endDateTime || orderDateTime <= endDateTime);
    });

    setFilteredOrders(filtered);
  };

  return (
    <div style={styles.filterContainer}>
      <label style={styles.label}>
        Start Date:
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={styles.input}
        />
      </label>
      <label style={styles.label}>
        Start Time:
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={styles.input}
        />
      </label>
      <label style={styles.label}>
        End Date:
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={styles.input}
        />
      </label>
      <label style={styles.label}>
        End Time:
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={styles.input}
        />
      </label>
      <button onClick={handleFilter} style={styles.button}>Filter</button>
    </div>
  );
};

const styles = {
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    gap: '10px',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    fontSize: '14px',
    color: '#555',
    marginRight: '10px',
  },
  input: {
    padding: '5px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginTop: '5px',
  },
  button: {
    padding: '5px 10px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  }
};

export default DateTimeFilter;
