import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './order.css'; // Import custom CSS file
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
import { startLoading, stopLoading } from '../../../redux/actions/defaultActions';
// import { markOrdersViewed } from '../../../redux/actions/markOrderViewedAction';
// import { fetchVendorChatOrders } from '../../../redux/actions/getAllChatOrdersAction';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { fetchChatOrdersByVendor, updateChatOrderAmountAndStatus } from '../../../redux/actions/chatOrdersActions';
import DateTimeFilter from '../../components/DateTimeFilter';


const ChatOrders = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.app.user);
  const vendorId = user._id;
  const { orders, loading, error } = useSelector((state) => state.chatOrders);

  // const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);


  console.log("orders-->>", orders)

  console.log("filteredOrders-->>", filteredOrders)

  // useEffect(() => {
  //   const fetchData = async () => {
  //     await dispatch(markOrdersViewed(vendorId));
  //     await dispatch(fetchVendorChatOrders(vendorId));
  //   };

  //   fetchData();
  // }, [dispatch, vendorId]);

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
      dispatch(fetchChatOrdersByVendor(vendorId))

      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      console.error('Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    setFilteredOrders(orders)
  }, [orders]);

  useEffect(() => {
    fetchOrders();
  }, [vendorId]);

  const getFormattedDate = (dateTime) => {
    const createdAtDate = new Date(dateTime);
    return `${createdAtDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} ${createdAtDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  };

  const handleDownloadInvoice = (order) => {
    const doc = new jsPDF();

    const totalAmount = (20).toFixed(2); // Assuming there is a delivery charge of 20
    const finalTotal = (parseFloat(totalAmount) + 20).toFixed(2);
    const rupeeSymbol = '\u20B9';

    doc.autoTable({
      body: [
        [
          {
            content: 'Seva Bazar',
            styles: { halign: 'left', fontSize: 20, textColor: '#ffffff' }
          },
          {
            content: 'Invoice',
            styles: { halign: 'right', fontSize: 20, textColor: '#ffffff' }
          }
        ],
      ],
      theme: 'plain',
      styles: { fillColor: '#3366ff' }
    });

    doc.autoTable({
      body: [
        [
          {
            content: `Reference: #${order.orderId}`
              + `\nDate: ${getFormattedDate(order.createdAt)}`
              + `\nInvoice number: ${order.orderId}`,
            styles: { halign: 'right' }
          }
        ],
      ],
      theme: 'plain'
    });

    doc.autoTable({
      body: [
        [
          {
            content: 'Billed to:'
              + `\n${order.customer.name}`
              + `\n${order.shippingAddress.address}`
              + `\n${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`
              + `\n${order.shippingAddress.country}`,
            styles: { halign: 'left' }
          },
          {
            content: 'Shipping address:'
              + `\n${order.customer.name}`
              + `\n${order.shippingAddress.address}`
              + `\n${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`
              + `\n${order.shippingAddress.country}`,
            styles: { halign: 'left' }
          },
          {
            content: 'From:'
              + '\nSeva Bazar'
              + '\nWest Bengal'
              + '\nIndia'
              + '\n713301 - Asansol'
              + '\nIndia',
            styles: { halign: 'right' }
          }
        ],
      ],
      theme: 'plain'
    });

    doc.autoTable({
      body: [
        [
          { content: 'Amount due:', styles: { halign: 'right', fontSize: 14 } }
        ],
        [
          { content: `rs ${finalTotal}`, styles: { halign: 'right', fontSize: 20, textColor: '#3366ff' } }
        ],
      ],
      theme: 'plain'
    });

    doc.autoTable({
      body: [
        [
          { content: 'Products', styles: { halign: 'left', fontSize: 14 } }
        ]
      ],
      theme: 'plain'
    });

    doc.autoTable({
      head: [['Items', 'Quantity', 'Price']],
      body: [
        ['Order Message', 1, `rs ${totalAmount}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: '#343a40' }
    });

    doc.autoTable({
      body: [
        [
          { content: 'Subtotal:', styles: { halign: 'right' } },
          { content: `rs ${totalAmount}`, styles: { halign: 'right' } },
        ],
        [
          { content: 'Delivery charge:', styles: { halign: 'right' } },
          { content: `rs 20`, styles: { halign: 'right' } },
        ],
        [
          { content: 'Total amount:', styles: { halign: 'right' } },
          { content: `rs ${finalTotal}`, styles: { halign: 'right' } },
        ],
      ],
      theme: 'plain'
    });

    doc.autoTable({
      body: [
        [
          { content: 'Terms & notes', styles: { halign: 'left', fontSize: 14 } }
        ],
        [
          {
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia'
              + 'molestiae quas vel sint commodi repudiandae consequuntur voluptatum laborum'
              + 'numquam blanditiis harum quisquam eius sed odit fugiat iusto fuga praesentium',
            styles: { halign: 'left' }
          }
        ],
      ],
      theme: "plain"
    });

    doc.autoTable({
      body: [
        [
          { content: 'Thank you!', styles: { halign: 'center' } }
        ]
      ],
      theme: "plain"
    });

    doc.save(`invoice_${order.orderId}.pdf`);
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
        dispatch(fetchChatOrdersByVendor(vendorId))
      })
      .catch((error) => {
        setAlertMessage(`Failed to update amount: ${error.message}`);
        setAlertVisible(true);
      });
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
      <div style={{ position: 'relative', overflowX: 'auto' }}>
        <CTable striped hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell style={{ minWidth: '100px' }}>Order ID</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '200px' }}>Date & Time</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '50px' }}>Customer</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '200px' }}>Shipping Address</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '150px' }}>Order Message</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '150px' }}>Add Amount</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '150px' }}>Payment Status</CTableHeaderCell>
              <CTableHeaderCell style={{ minWidth: '150px' }}>Invoice</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredOrders?.map((order, index) => (
              <CTableRow key={index}>
                <CTableDataCell>{order.orderId}</CTableDataCell>
                <CTableDataCell>{getFormattedDate(order.createdAt)}</CTableDataCell>
                <CTableDataCell>{order.customer.name}</CTableDataCell>
                <CTableDataCell>{order.shippingAddress.address}</CTableDataCell>
                <CTableDataCell>{order.orderMessage}</CTableDataCell>
                <CTableDataCell>
                  <input
                    value={order.totalAmount}
                    type="number"
                    onChange={(e) => handleAddAmountChange(order.orderId, e.target.value)}
                  />
                </CTableDataCell>
                <CFormSelect
                  // value={order.paymentStatus}
                  // onChange={(e) => handlePaymentStatusChange(order.orderId, e.target.value)}
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </CFormSelect>
                <CTableDataCell>
                  <CButton color="primary" onClick={() => handleDownloadInvoice(order)}>
                    Download Invoice
                  </CButton>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          {filteredOrders.length === 0 && <p>No Orders to Display</p>}
        </div>
      </div>
    </div>
  );
};

export default ChatOrders;
