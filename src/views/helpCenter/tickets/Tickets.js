import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CFormSelect,
  CRow,
  CCol,
  CFormLabel,
  CCard,
  CCardHeader,
  CCardBody
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSpeech } from '@coreui/icons';
import axiosInstance from '../../../utils/axiosConfig';

const Tickets = () => {
  const { userType: userTypeParam } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');

  useEffect(() => {
    if (userTypeParam) {
      setUserTypeFilter(userTypeParam);
    } else {
      setUserTypeFilter('');
    }
  }, [userTypeParam]);

  const fetchTickets = async () => {
    if (!userTypeFilter) {
      setTickets([]);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get(`/tickets?userType=${userTypeFilter}`, {
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
      setError('Error fetching tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [userTypeFilter]);

  const getUserDetails = (ticket) => {
    const type = ticket.userType || 'Customer';

    switch (type) {
      case 'Vendor':
        return {
          name: ticket.vendor?.vendorInfo?.businessName || ticket.vendor?.name || 'N/A',
          phone: ticket.vendor?.vendorInfo?.contactNumber || ticket.vendor?.email || 'N/A'
        };
      case 'Driver':
        return {
          name: ticket.driver?.personalDetails?.name || 'N/A',
          phone: ticket.driver?.personalDetails?.phone || 'N/A'
        };
      case 'Customer':
      default:
        return {
          name: ticket.customer?.name || 'N/A',
          phone: ticket.customer?.contactNumber || 'N/A'
        };
    }
  };

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h3>{userTypeFilter ? `${userTypeFilter} Support Tickets` : 'Support Tickets'}</h3>
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {!userTypeFilter ? (
          <div className="text-center p-5">
            <CIcon icon={cilSpeech} size="xl" className="mb-3 opacity-25" />
            <h4 className="text-muted">Please select a user type from the sidebar to view tickets.</h4>
          </div>
        ) : loading ? (
          <div className="text-center p-5">
            <CSpinner color="primary" />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <CTable striped hover bordered>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ width: '20%' }}>Date</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '25%' }}>Name</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '15%' }}>Contact Info</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '30%' }}>Reason</CTableHeaderCell>
                  <CTableHeaderCell style={{ width: '10%' }}>Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {tickets.length === 0 ? (
                  <CTableRow>
                    <CTableDataCell colSpan="6" className="text-center">No tickets found for {userTypeFilter}</CTableDataCell>
                  </CTableRow>
                ) : (
                  tickets.map((ticket) => {
                    const user = getUserDetails(ticket);
                    return (
                      <CTableRow key={ticket._id}>
                        <CTableDataCell>{new Date(ticket.createdAt).toLocaleString()}</CTableDataCell>
                        <CTableDataCell>{user.name}</CTableDataCell>
                        <CTableDataCell>{user.phone}</CTableDataCell>
                        <CTableDataCell>{ticket.reason}</CTableDataCell>
                        <CTableDataCell>{ticket.status}</CTableDataCell>
                      </CTableRow>
                    );
                  })
                )}
              </CTableBody>
            </CTable>
          </div>
        )}
      </CCardBody>
    </CCard>
  );
};

export default Tickets;
