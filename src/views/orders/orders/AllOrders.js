import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './order.css' // Import custom CSS file


import { startLoading, stopLoading } from '../../../store';
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
  CAlert
} from '@coreui/react';
import { getOrdersByVendor } from '../../../api/orders/getOrdersByVendor';
import { updateOrderPaymentStatus, updateOrderStatus } from '../../../api/orders/updateOrderStatus';
import DateTimeFilter from '../../components/DateTimeFilter';
import SearchComponent from '../../components/Search';

const AllOrders = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user)
  const vendorId = user._id

  console.log("vendorId-->>", vendorId)

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);

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
  const getFormattedDate = (dateTime) => {
    const createdAtDate = new Date(dateTime);
    const formattedCreatedDate = `${createdAtDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ${createdAtDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    return formattedCreatedDate

  }



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
      <div style={{ position: 'relative', overflowX: 'auto' }}>
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ minWidth: '100px' }}>Order ID</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '200px' }}>Date & Time</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '50px' }}>Name</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '120px' }}>Number</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '200px' }}>Shipping Address</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '130px' }}>Products</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '200px' }}>Breakdown</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '120px' }}>Total</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '150px' }}>Payment Status</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '150px' }}>Status</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredOrders?.map((order, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{order.orderId}</CTableDataCell>
                <CTableDataCell>{getFormattedDate(order.createdAt)}</CTableDataCell>
                <CTableDataCell>{order.customer.name}</CTableDataCell>
                <CTableDataCell>{order.customer.contactNumber}</CTableDataCell>
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
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <p style={{ fontSize: '14px', color: '#888' }}>Scroll &gt;&gt; to see more</p>
        </div>
      </div>
    </div>
  );
};

export default AllOrders;
