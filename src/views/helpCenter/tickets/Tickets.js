import React, { useState, useEffect } from 'react';
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert
} from '@coreui/react';
import axiosInstance from '../../../utils/axiosConfig';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
       // Accessing /tickets endpoint. Assuming baseUrl is set in axiosInstance
       // Backend route is mounted at /tickets. And controller has getAll at /
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/tickets', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
      });
      if (response.data && response.data.success) {
        setTickets(response.data.tickets);
      } else {
        setError('Failed to fetch tickets');
      }
    } catch (err) {
      console.error(err);
      setError('Error creating request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) return <CSpinner color="primary" />;

  return (
    <div>
      <h3>Support Tickets</h3>
      {error && <CAlert color="danger">{error}</CAlert>}
      <div style={{ overflowX: 'auto' }}>
        <CTable striped hover bordered>
            <CTableHead>
            <CTableRow>
                <CTableHeaderCell>Date</CTableHeaderCell>
                <CTableHeaderCell>Customer Name</CTableHeaderCell>
                <CTableHeaderCell>Phone Number</CTableHeaderCell>
                <CTableHeaderCell>Reason</CTableHeaderCell>
                <CTableHeaderCell>Status</CTableHeaderCell>
            </CTableRow>
            </CTableHead>
            <CTableBody>
            {tickets.map((ticket) => (
                <CTableRow key={ticket._id}>
                <CTableDataCell>{new Date(ticket.createdAt).toLocaleString()}</CTableDataCell>
                <CTableDataCell>{ticket.customer?.name || 'N/A'}</CTableDataCell>
                <CTableDataCell>{ticket.customer?.contactNumber || 'N/A'}</CTableDataCell>
                <CTableDataCell>{ticket.reason}</CTableDataCell>
                <CTableDataCell>{ticket.status}</CTableDataCell>
                </CTableRow>
            ))}
            </CTableBody>
        </CTable>
      </div>
    </div>
  );
};

export default Tickets;
