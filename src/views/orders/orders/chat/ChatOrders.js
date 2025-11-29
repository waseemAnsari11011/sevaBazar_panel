import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '../order.css'; // Import custom CSS file
import {
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
  CFormSelect
} from '@coreui/react';
import { startLoading, stopLoading } from '../../../../redux/actions/defaultActions';
import { fetchChatOrdersByVendor, updateChatOrderAmountAndStatus, updateChatOrderStatus, updateChatPaymentStatusManually } from '../../../../redux/actions/chatOrdersActions';
import DateTimeFilter from '../../../components/DateTimeFilter';
import { fetchVendorChatOrders, markChatOrdersViewed } from '../../../../redux/actions/getNewChatOrdersAction';
import { handleDownloadChatInvoice } from '../utils';
import CIcon from '@coreui/icons-react'
import { cilCloudDownload, cilChevronLeft, cilChevronRight, cilChevronCircleRightAlt } from '@coreui/icons';
import CreateChatOrderModal from './createChatOrder';

const ChatOrders = () => {
  const tableContainerRef = useRef(null);

  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft -= 100; // Adjust scroll amount as needed
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollLeft += 100; // Adjust scroll amount as needed
    }
  };
  const dispatch = useDispatch();
  const user = useSelector((state) => state.app.user);
  const vendorId = user._id;
  const { orders, loading, error } = useSelector((state) => state.chatOrders);

  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(markChatOrdersViewed(vendorId));
      await dispatch(fetchVendorChatOrders(vendorId));
    };

    fetchData();
  }, [dispatch, vendorId]);

  useEffect(() => {
    let timeout;
    if (alertVisible) {
      timeout = setTimeout(() => {
        setAlertVisible(false);
      }, 1000); // Hide alert after 1 second (adjust as needed)
    }
    return () => clearTimeout(timeout);
  }, [alertVisible]);

  const fetchOrders = async () => {
    try {
      dispatch(startLoading());
      await dispatch(fetchChatOrdersByVendor(vendorId));
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      console.error('Failed to fetch orders:', error);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!searchTerm) {
      setFilteredOrders(orders);
    } else {
      const lowerCaseTerm = searchTerm.toLowerCase();
      const filtered = orders.filter(order => 
        (order.customer?.name && order.customer.name.toLowerCase().includes(lowerCaseTerm)) ||
        (order.shortId && order.shortId.toLowerCase().includes(lowerCaseTerm)) ||
        (order.orderId && order.orderId.toLowerCase().includes(lowerCaseTerm))
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  useEffect(() => {
    fetchOrders();
  }, [vendorId]);

  const getFormattedDate = (dateTime) => {
    const createdAtDate = new Date(dateTime);
    return `${createdAtDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ${createdAtDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  const handleAddAmountChange = (orderId, amount) => {
    if (isNaN(amount) || amount < 0) {
      setAlertMessage('Please enter a valid amount.');
      setAlertVisible(true);
      return;
    }
    dispatch(updateChatOrderAmountAndStatus(orderId, parseFloat(amount)))
      .then(() => {
        setAlertMessage('Amount updated successfully.');
        setAlertVisible(true);
        dispatch(fetchChatOrdersByVendor(vendorId));
      })
      .catch((error) => {
        setAlertMessage(`Failed to update amount: ${error.message}`);
        setAlertVisible(true);
      });
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    dispatch(updateChatPaymentStatusManually(orderId, newStatus)).then(() => {
      setAlertMessage('Order status updated successfully');
      setAlertVisible(true);
      dispatch(fetchChatOrdersByVendor(vendorId));
    }).catch((error) => {
      setAlertMessage(`Failed to update amount: ${error.message}`);
      setAlertVisible(true);
    });
  };

  const handleStatusChange = async (orderId, vendorId, newStatus) => {
    dispatch(updateChatOrderStatus(orderId, newStatus)).then(() => {
      setAlertMessage('Order status updated successfully');
      setAlertVisible(true);
      dispatch(fetchChatOrdersByVendor(vendorId));
    }).catch((error) => {
      setAlertMessage(`Failed to update amount: ${error.message}`);
      setAlertVisible(true);
    });
  };

  return (
    <div>
      {alertVisible && (
        <CAlert color={'success'} onClose={() => setAlertVisible(false)} dismissible>
          {alertMessage}
        </CAlert>
      )}
      <div>
        <DateTimeFilter orders={orders} setFilteredOrders={setFilteredOrders} />
        <div style={{ margin: '10px 0' }}>
          <input
            type="text"
            placeholder="Search by Customer Name or Order ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px',
              width: '100%',
              maxWidth: '300px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>
      </div>
      <div style={{ position: 'relative', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: "14px", }}>
          <CButton color="warning" onClick={scrollLeft} style={{ cursor: 'pointer', marginRight: "10px" }}>
            <CIcon icon={cilChevronLeft} />
          </CButton>
          <CButton color="warning" onClick={scrollRight} style={{ cursor: 'pointer' }}>
            <CIcon icon={cilChevronRight} />
          </CButton>
        </div>
        <div ref={tableContainerRef} style={{ overflowX: 'auto', flexGrow: 1 }}>
          <CTable striped hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ minWidth: '100px' }}>Order ID</CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '200px' }}>Date & Time</CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '50px' }}>Customer</CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '120px' }}>Number</CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '200px' }}>Shipping Address</CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '150px' }}>Order Message</CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '150px' }}>Create Order</CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '150px' }}>Payment Status</CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '150px' }}>Status</CTableHeaderCell>
                <CTableHeaderCell style={{ minWidth: '10px' }}>Invoice</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredOrders?.map((order, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{order.shortId}</CTableDataCell>
                  <CTableDataCell>{getFormattedDate(order.createdAt)}</CTableDataCell>
                  <CTableDataCell>{order.shippingAddress.name ? order.shippingAddress.name : order.customer.name}</CTableDataCell>
                  <CTableDataCell>{order.shippingAddress.phone ? `${order.shippingAddress.phone}, ${order.customer.contactNumber}` : order.customer.contactNumber}</CTableDataCell>
                  <CTableDataCell>{order.shippingAddress.address}</CTableDataCell>
                  <CTableDataCell>{order.orderMessage}</CTableDataCell>
                  <CTableDataCell><CreateChatOrderModal orderId={order.orderId} vendorId={vendorId} orderMsg={order.orderMessage} /></CTableDataCell>
                  <CTableDataCell>
                    <CFormSelect
                      value={order.paymentStatus}
                      onChange={(e) => handlePaymentStatusChange(order.orderId, e.target.value)}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </CFormSelect>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CFormSelect
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order.orderId, order.vendors.vendor._id, e.target.value)}
                    >
                      <option value="In Review">In Review</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </CFormSelect>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="warning"
                      onClick={async () => await handleDownloadChatInvoice(order)}
                      style={{ cursor: 'pointer' }}
                    >
                      <CIcon icon={cilCloudDownload} />
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          {filteredOrders.length === 0 && <p>No Orders to Display</p>}
        </div>
      </div>
    </div>
  );
};

export default ChatOrders;
