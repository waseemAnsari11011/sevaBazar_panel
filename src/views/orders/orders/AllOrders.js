import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';


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
import {getOrdersByVendor} from '../../../api/orders/getOrdersByVendor';
import { updateOrderPaymentStatus, updateOrderStatus } from '../../../api/orders/updateOrderStatus';

const AllOrders = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user)
  const vendorId = user._id

  console.log("vendorId-->>", vendorId)

  const [orders, setOrders] = useState([]);
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

      console.log("ordersData-->>", ordersData)
      setOrders(ordersData);
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
      <CTable striped hover responsive="sm">
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Order ID</CTableHeaderCell>
            <CTableHeaderCell>Customer</CTableHeaderCell>
            <CTableHeaderCell>Shipping Address</CTableHeaderCell>
            <CTableHeaderCell>Products</CTableHeaderCell>
            <CTableHeaderCell>Breakdown</CTableHeaderCell>
            <CTableHeaderCell>Total</CTableHeaderCell>
            <CTableHeaderCell>Payment Status</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {orders?.map((order, index) => (
            <CTableRow key={index}>
              <CTableDataCell>{order.orderId}</CTableDataCell>
              <CTableDataCell>{order.customer.contactNumber}</CTableDataCell>
              <CTableDataCell>{order.shippingAddress.address}</CTableDataCell>
              <CTableDataCell>
                {order.vendors.products.map((product, idx) => (
                  <div key={idx}>
                    {product.product.name}
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
                  const actualPrice = product.price;
                  const discountPercentage = product.discount;
                  const discountAmount = (actualPrice * discountPercentage) / 100;
                  const discountedPrice = (actualPrice - discountAmount) * product.quantity;

                  return total + discountedPrice;
                }, 0).toFixed(2)}
              </CTableDataCell>
              {/* <CTableDataCell>{order.isPaymentVerified ? "Paid" : "UnPaid"}</CTableDataCell> */}
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

    </div>
  );
};

export default AllOrders;
