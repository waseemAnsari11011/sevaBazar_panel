import React, { useState, useEffect } from 'react'
import classNames from 'classnames'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
  
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import { getRecentOrdersByVendor, getProductsLowQuantity } from '../../api/orders/getOrdersByVendor'
import { startLoading, stopLoading } from '../../store'
import { useDispatch, useSelector } from 'react-redux'
import axiosInstance, { baseURL } from '../../utils/axiosConfig'
import '../products/Products.css' // Import custom CSS file
import getAllInquiries from '../../api/Inquiry/getAllInquiries'


const Dashboard = () => {
  const dispatch = useDispatch()
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([])
  const [inquiries, setInquiries] = useState([]);

  const user = useSelector((state) => state.user)
  const userRole = user ? user.role : null;
  const vendorId = user._id

  const fetchRecentOrders = async () => {
    try {
      dispatch(startLoading());
      const recentOrdersData = await getRecentOrdersByVendor(vendorId);

      console.log("recentOrdersData-->>", recentOrdersData)
      setOrders(recentOrdersData);
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      console.error('Failed to fetch orders:', error);
    }
  };

  const fetchInquiries = async () => {
    dispatch(startLoading());
    try {
      const response = await getAllInquiries();
      setInquiries(response);
      dispatch(stopLoading());
    } catch (error) {
      console.error('Failed to get inquiries:', error);
      setError(error.message);
      dispatch(stopLoading());
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  useEffect(() => {
    fetchRecentOrders();
  }, [vendorId]);

  const fetchLowQuantityProducts = async () => {
    try {
      dispatch(startLoading());
      const lowQuantityProducts = await getProductsLowQuantity(vendorId);

      console.log("lowQuantityProducts-->>", lowQuantityProducts)
      setProducts(lowQuantityProducts);
      dispatch(stopLoading());
    } catch (error) {
      dispatch(stopLoading());
      console.error('Failed to fetch orders:', error);
    }
  };

  useEffect(() => {
    fetchLowQuantityProducts();
  }, [vendorId]);


  const handleStockUpdate = async (productId, product) => {
    console.log("product--->>>", product)
    try {
      const response = await axiosInstance.put(`/products/${productId}`, product);

      if (response.status === 200) {
        console.log('Stock updated successfully:', response.data.product);
        // Optionally, update the product state to reflect the new quantity in the UI
      } else {
        console.error('Failed to update stock:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const getBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'responded':
        return 'success';
      case 'closed':
        return 'secondary';
      default:
        return 'primary';
    }
  };






  return (
    <>
      <WidgetsDropdown className="mb-4" />

      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Recent Orders</CCardHeader>
            <CCardBody>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Order ID</CTableHeaderCell>
                    <CTableHeaderCell>Customer</CTableHeaderCell>
                    <CTableHeaderCell>Shipping Address</CTableHeaderCell>
                    <CTableHeaderCell>Products</CTableHeaderCell>
                    <CTableHeaderCell>Breakdown</CTableHeaderCell>
                    <CTableHeaderCell>Total</CTableHeaderCell>

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

                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
          <CCard className="mb-4">
            <CCardHeader>Low Stock Inventory</CCardHeader>
            <CCardBody>
              <CTable striped>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Photo</CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Description</CTableHeaderCell>
                    <CTableHeaderCell>Price</CTableHeaderCell>
                    <CTableHeaderCell>Discount</CTableHeaderCell>
                    <CTableHeaderCell>Stock</CTableHeaderCell>
                    <CTableHeaderCell>Update Stock</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {products.map((product, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>
                        {product.images.slice(0, 2).map((file, imgIndex) => (
                          <img
                            key={imgIndex}
                            src={`${baseURL}/${file}`}
                            alt={`Product Image ${imgIndex + 1}`}
                            className="table-img"
                          />
                        ))}
                      </CTableDataCell>
                      <CTableDataCell>{product.name}</CTableDataCell>
                      <CTableDataCell>{product.description}</CTableDataCell>
                      <CTableDataCell>{product.price}</CTableDataCell>
                      <CTableDataCell>{product.discount}</CTableDataCell>
                      <CTableDataCell>{product.quantity}</CTableDataCell>
                      <CTableDataCell>
                        <input
                          type="number"
                          defaultValue={product.quantity}
                          onChange={(e) => handleStockUpdate(product._id, { ...product, existingImages: product.images, quantity: e.target.value })}
                        />
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

            </CCardBody>
          </CCard>
          {userRole !== 'vendor'&&<CCard className="mb-4">
            <CCardHeader>Customer Messages</CCardHeader>
            <CCardBody>
              <CTable responsive="sm" striped>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>#</CTableHeaderCell>
                    <CTableHeaderCell>Subject</CTableHeaderCell>
                    <CTableHeaderCell>Message</CTableHeaderCell>
                    <CTableHeaderCell>Response</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    {/* <CTableHeaderCell>Actions</CTableHeaderCell> */}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {inquiries.map((inquiry, index) => (
                    <CTableRow key={inquiry._id}>
                      <CTableDataCell>{index + 1}</CTableDataCell>
                      <CTableDataCell>{inquiry.subject}</CTableDataCell>
                      <CTableDataCell>{inquiry.message}</CTableDataCell>
                      <CTableDataCell>{inquiry.response}</CTableDataCell>
                      <CTableDataCell> <CBadge color={getBadgeColor(inquiry.status)}>{inquiry.status}</CBadge></CTableDataCell>
                      {/* <CTableDataCell>
                        <CButton color="primary" onClick={() => toggleModal(inquiry._id)}>Send Response</CButton>
                      </CTableDataCell> */}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>}
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
