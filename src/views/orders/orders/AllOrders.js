import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './order.css' // Import custom CSS file


// import { startLoading, stopLoading } from '../../../store';

// import { updateOrderStatus } from '../../../api/order/updateOrderStatus';
import {
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CAlert,

} from '@coreui/react';
import CIcon from '@coreui/icons-react'
import { getOrdersByVendor } from '../../../api/orders/getOrdersByVendor';
import { updateOrderPaymentStatus, updateOrderStatus } from '../../../api/orders/updateOrderStatus';
import DateTimeFilter from '../../components/DateTimeFilter';
import SearchComponent from '../../components/Search';

import { startLoading, stopLoading } from '../../../redux/actions/defaultActions';
import { markOrdersViewed } from '../../../redux/actions/markOrderViewedAction';
import { fetchVendorOrders } from '../../../redux/actions/getAllOrdersAction';
import { getFormattedDate, handleDownloadInvoice } from './utils';

import { cilCloudDownload, cilChevronLeft, cilChevronRight, cilChevronCircleRightAlt } from '@coreui/icons';

const AllOrders = () => {
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


  /////////////////////
  const dispatch = useDispatch();
  const user = useSelector((state) => state.app.user)
  const vendorId = user._id

  console.log("vendorId-->>", vendorId)

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(markOrdersViewed(vendorId));
      await dispatch(fetchVendorOrders(vendorId));
    };

    fetchData();
  }, []);

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
      const ordersData = await getOrdersByVendor(vendorId);

      console.log("ordersData-->>", ordersData);
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      console.error('Failed to fetch orders:', error);
    }
  };


  useEffect(() => {
    fetchOrders();
  }, [vendorId]);

  const handleStatusChange = async (orderId, vendorId, newStatus) => {
    try {
      await updateOrderStatus(orderId, vendorId, newStatus);
      setAlertMessage('Order status updated successfully');
      setAlertVisible(true);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderPaymentStatus(orderId, newStatus);
      setAlertMessage('Order status updated successfully');
      setAlertVisible(true);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
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
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div ref={tableContainerRef} style={{ overflowX: 'auto', flexGrow: 1 }}>
            <CTable striped hover>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell style={{ minWidth: '100px' }}>Order ID</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '200px' }}>Date & Time</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '50px' }}>Customer</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '120px' }}>Number</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '200px' }}>Shipping Address</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '130px' }}>Products</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '300px' }}>Vendor</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '200px' }}>Breakdown</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '120px' }}>Total</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '150px' }}>Payment Status</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '170px' }}>Status</CTableHeaderCell>
                  <CTableHeaderCell style={{ minWidth: '10px' }}>Invoice</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredOrders?.map((order, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{order.shortId}</CTableDataCell>
                    <CTableDataCell>{getFormattedDate(order.createdAt)}</CTableDataCell>
                    <CTableDataCell>{order.shippingAddress.name ? order.shippingAddress.name : order.customer.name}</CTableDataCell>
                    <CTableDataCell>{order.shippingAddress.phone ? order.shippingAddress.phone : order.customer.contactNumber}</CTableDataCell>
                    <CTableDataCell>{order.shippingAddress.address}</CTableDataCell>
                    <CTableDataCell>
                      {order.vendors.products.map((product, idx) => (
                        <div key={idx}>
                          {product.product.name}
                          {product.orderedVariations?.map((variation, varIdx) => (
                            <div key={varIdx}>
                              {variation.attributes.selected} : {variation.attributes.value}
                            </div>
                          ))}
                        </div>
                      ))}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div>
                        <strong>Business Name:</strong> {order.vendors.vendor.vendorInfo?.businessName}
                      </div>
                      <div>
                        <strong>Contact Number:</strong> {order.vendors.vendor.vendorInfo?.contactNumber}
                      </div>
                      <div>
                        <strong>Alternative Contact Number:</strong> {order.vendors.vendor?.vendorInfo?.alternativeContactNumber}
                      </div>
                      <div>
                        <strong>Address :</strong> {order.vendors.vendor.vendorInfo?.address?.addressLine1}
                      </div>
                      <div>
                        <strong>Postal Code:</strong> {order.vendors.vendor.vendorInfo.address?.postalCode}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      {order.vendors.products.map((product, idx) => {
                        const actualPrice = product.price;
                        const discountPercentage = product.discount;
                        const discountAmount = (actualPrice * discountPercentage) / 100;
                        const discountedPrice = (actualPrice - discountAmount) * product.quantity;
                        return (
                          <div key={idx}>
                            {product.quantity} x ₹{actualPrice.toFixed(2)} - {discountPercentage}% = ₹{discountedPrice.toFixed(2)}
                          </div>
                        );
                      })}
                    </CTableDataCell>
                    <CTableDataCell>
                      ₹{order.vendors.products.reduce((total, product) => {
                        const totalAmount = product.totalAmount;
                        return total + totalAmount;
                      }, 0).toFixed(2)}+ ₹20
                    </CTableDataCell>
                    <CTableDataCell>
                      {order.razorpay_payment_id ? (
                        <CFormSelect
                          value={order.paymentStatus}
                          onChange={(e) => handlePaymentStatusChange(order.orderId, e.target.value)}
                          disabled
                        >
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                        </CFormSelect>
                      ) : (
                        <CFormSelect
                          value={order.paymentStatus}
                          onChange={(e) => handlePaymentStatusChange(order.orderId, e.target.value)}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                        </CFormSelect>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CFormSelect
                        value={order.vendors.orderStatus}
                        onChange={(e) => handleStatusChange(order.orderId, order.vendors.vendor._id, e.target.value)}
                      >
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
                        onClick={async () => await handleDownloadInvoice(order)}
                        style={{ cursor: 'pointer' }}
                      >                        <CIcon icon={cilCloudDownload} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Use the buttons to scroll &gt;&gt; to see more
          </p>
        </div>
      </div>




    </div>
  );
};

export default AllOrders;
