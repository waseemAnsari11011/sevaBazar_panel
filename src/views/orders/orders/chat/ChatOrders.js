import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { cilCloudDownload, cilChevronLeft, cilChevronRight } from '@coreui/icons';
import CreateChatOrderModal from './createChatOrder';

const ChatOrders = () => {
  const navigate = useNavigate();
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
      <div style={{ position: 'relative' }}>
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
                <CTableHeaderCell>Order ID</CTableHeaderCell>
                <CTableHeaderCell>Date & Time</CTableHeaderCell>
                <CTableHeaderCell>Customer</CTableHeaderCell>
                <CTableHeaderCell>Driver</CTableHeaderCell>
                <CTableHeaderCell>Products</CTableHeaderCell>
                <CTableHeaderCell>Vendor</CTableHeaderCell>
                <CTableHeaderCell>Order Process</CTableHeaderCell>
                <CTableHeaderCell>Invoice</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {filteredOrders?.map((order, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{order.shortId}</CTableDataCell>
                  <CTableDataCell>{getFormattedDate(order.createdAt)}</CTableDataCell>

                  {/* Customer Details */}
                  <CTableDataCell>
                    <div>
                      <strong>Name:</strong> {order.shippingAddress?.name || order.customer?.name}
                    </div>
                    <div>
                      <strong>Phone:</strong> {order.shippingAddress?.phone || order.customer?.contactNumber}
                    </div>
                    <div>
                      <strong>Address:</strong> {order.shippingAddress?.address || 'N/A'}
                    </div>
                    <div>
                      <strong>City:</strong> {order.shippingAddress?.city || ''} {order.shippingAddress?.postalCode || ''}
                    </div>
                  </CTableDataCell>

                  {/* Driver Details */}
                  <CTableDataCell>
                    {(() => {
                      const driverObj = order.driverId || order.driver;
                      return driverObj ? (
                        <>
                          <div>
                            <strong>Name:</strong> {driverObj.personalDetails?.name}
                          </div>
                          <div>
                            <strong>Phone:</strong> {driverObj.personalDetails?.phone}
                          </div>
                          <div>
                            <strong>Vehicle:</strong> {driverObj.vehicleDetails?.plateNumber} ({driverObj.vehicleDetails?.type})
                          </div>
                        </>
                      ) : (
                        <span className="text-muted">Not Assigned</span>
                      );
                    })()}
                  </CTableDataCell>

                  {/* Products */}
                  <CTableDataCell>
                    {order.products && order.products.length > 0 ? (
                      order.products.map((product, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ width: '40px', height: '40px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginRight: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* Chat orders usually don't have product images in the same way, but showing name/quantity */}
                            <CIcon icon={cilChevronRight} size="sm" />
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{product.name}</div>
                            <small>Qty: {product.quantity} @ ₹{product.price}</small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted">{order.orderMessage}</div>
                    )}
                  </CTableDataCell>

                  {/* Vendor Details */}
                  <CTableDataCell>
                    <div>
                      <strong>Business:</strong> {order.vendors?.vendor?.vendorInfo?.businessName || 'N/A'}
                    </div>
                    <div>
                      <strong>Phone:</strong> {order.vendors?.vendor?.vendorInfo?.contactNumber || 'N/A'}
                    </div>
                    <div>
                      <strong>Address:</strong> {order.vendors?.vendor?.vendorInfo?.address?.addressLine1 || 'N/A'}
                    </div>
                  </CTableDataCell>

                  {/* Order Process (Create Order, Status, Payment) */}
                  <CTableDataCell>
                    <div className="mb-2">
                      <CreateChatOrderModal orderId={order.orderId} vendorId={vendorId} orderMsg={order.orderMessage} />
                    </div>
                    <div className="mb-2">
                      <small className="d-block text-muted">Status:</small>
                      <CFormSelect
                        size="sm"
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order.orderId, order.vendors?.vendor?._id, e.target.value)}
                      >
                        <option value="In Review">In Review</option>
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </CFormSelect>
                    </div>
                    <div>
                      <small className="d-block text-muted">Payment:</small>
                      <CFormSelect
                        size="sm"
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(order.orderId, e.target.value)}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                      </CFormSelect>
                    </div>
                  </CTableDataCell>

                  {/* Actions */}
                  <CTableDataCell>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <CButton
                        color="warning"
                        size="sm"
                        onClick={async () => await handleDownloadChatInvoice(order)}
                        style={{ cursor: 'pointer' }}
                      >
                        <CIcon icon={cilCloudDownload} />
                      </CButton>
                      <CButton
                        color="info"
                        size="sm"
                        className="text-white"
                        onClick={() => navigate(`/orders/order-details/${order.orderId}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        View Detail
                      </CButton>
                    </div>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </div>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          {filteredOrders.length === 0 && <p>No Orders to Display</p>}
          <p style={{ fontSize: '14px', color: '#888' }}>
            Use the buttons to scroll &gt;&gt; to see more
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatOrders;
