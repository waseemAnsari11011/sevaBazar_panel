import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CRow,
    CCol,
    CButton,
    CFormSelect,
    CSpinner,
    CBadge
} from '@coreui/react';
import api from '../../../utils/axiosConfig';

const OrderDetails = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.app.user); // Get logged in user (Admin/Vendor)
    const isAdmin = user?.role === 'admin';

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Status Colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'warning';
            case 'Paid': return 'success';
            default: return 'secondary';
        }
    };

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            // Use user._id as vendorId (works for Admin too due to backend update)
            const response = await api.get(`/order/${orderId}/vendor/${user._id}`);
            if (response.data && response.data.success) {
                setOrder(response.data.data);
            } else {
                setError('Failed to load order details');
            }
        } catch (err) {
            console.error(err);
            setError('Error loading order details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const handlePaymentStatusChange = async (type, status) => {
        try {
            // type: 'vendorPayment' | 'driverEarning' | 'floatingCash'
            await api.put(`/admin-update-payment-status/${order._id}`, {
                type,
                status
            });
            fetchOrderDetails(); // Refresh data
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Failed to update status');
        }
    };

    if (loading) return <div className="text-center mt-5"><CSpinner /></div>;
    if (error) return <div className="text-center mt-5 text-danger">{error}</div>;
    if (!order) return <div className="text-center mt-5">Order not found</div>;


    return (
        <div className="p-4">
            <h3 className="mb-4">Order Details: #{order.orderId}</h3>

            {/* SECTION 1: ORDER DETAILS (Visible to All) */}
            <CCard className="mb-4">
                <CCardHeader><strong>Order Information</strong></CCardHeader>
                <CCardBody>
                    <CRow>
                        <CCol md={6}>
                            <p><strong>Customer Name:</strong> {order.customer?.name || order.customerNameFallback}</p>
                            <p><strong>Phone:</strong> {order.customer?.contactNumber}</p>
                            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                            <p><strong>Shipping Address:</strong> {order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                        </CCol>
                        <CCol md={6}>
                            <p><strong>Order Status:</strong> {order.orderStatus}</p>
                            <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                        </CCol>
                    </CRow>
                    <hr />
                    <h5>Items</h5>
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="mb-2 p-2 border rounded d-flex">
                            {item.image &&
                                <img src={item.image} alt={item.name} style={{ width: 50, height: 50, marginRight: 10, objectFit: 'cover' }} />
                            }
                            <div>
                                <strong>{item.name}</strong><br />
                                <small>{item.quantity} x ₹{item.price}</small>
                            </div>
                            <div className="ms-auto">
                                ₹{item.totalAmount}
                            </div>
                        </div>
                    ))}
                </CCardBody>
            </CCard>

            {/* SECTION 2: VENDOR DETAILS / EARNING */}
            <CCard className="mb-4">
                <CCardHeader><strong>{isAdmin ? 'Vendor Details' : 'Vendor Earning'}</strong></CCardHeader>
                <CCardBody>
                    <CRow>
                        {isAdmin && (
                            <CCol md={6}>
                                <p><strong>Business Name:</strong> {order.vendorDetails?.vendorInfo?.businessName}</p>
                                <p><strong>Owner Name:</strong> {order.vendorDetails?.name}</p>
                                <p><strong>Phone:</strong> {order.vendorDetails?.vendorInfo?.contactNumber}</p>
                                <p><strong>Address:</strong> {order.vendorDetails?.vendorInfo?.address?.addressLine1}</p>
                            </CCol>
                        )}
                        <CCol md={6}>
                            <p><strong>Total Product Price (Earning):</strong> ₹{order.totalAmount}</p>
                            <p><strong>Payment Status:</strong> <CBadge color={getStatusColor(order.vendorPaymentStatus)}>{order.vendorPaymentStatus || 'Pending'}</CBadge></p>

                            {isAdmin && (
                                <div className="mt-2">
                                    <label>Update Payment Status:</label>
                                    <CFormSelect
                                        value={order.vendorPaymentStatus || 'Pending'}
                                        onChange={(e) => handlePaymentStatusChange('vendorPayment', e.target.value)}
                                        style={{ maxWidth: 200 }}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                    </CFormSelect>
                                </div>
                            )}
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* SECTION 3: DRIVER DETAILS (Visible to all, but content varies by role) */}
            {order.driver ? (
                <CCard className="mb-4">
                    <CCardHeader><strong>Driver Details</strong></CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol md={6}>
                                <p><strong>Name:</strong> {order.driver.personalDetails?.name}</p>
                                <p><strong>Phone:</strong> {order.driver.personalDetails?.phone}</p>
                                <p><strong>Vehicle:</strong> {order.driver.vehicleDetails?.plateNumber} ({order.driver.vehicleDetails?.type})</p>
                            </CCol>
                            <CCol md={6}>
                                {/* Driver Earning */}
                                <div className={isAdmin ? "mb-3 border-bottom pb-2" : "mb-3"}>
                                    <h6>Driver Earning</h6>
                                    <p><strong>Amount:</strong> ₹{order.driverDeliveryFee?.totalFee || 0}</p>
                                    <p>Status: <CBadge color={getStatusColor(order.driverEarningStatus)}>{order.driverEarningStatus || 'Pending'}</CBadge></p>

                                    {isAdmin && (
                                        <CFormSelect
                                            value={order.driverEarningStatus || 'Pending'}
                                            onChange={(e) => handlePaymentStatusChange('driverEarning', e.target.value)}
                                            size="sm"
                                            style={{ maxWidth: 150 }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Paid">Paid</option>
                                        </CFormSelect>
                                    )}
                                </div>

                                {/* Floating Cash (Admin Only) */}
                                {isAdmin && (
                                    <div>
                                        <h6>Floating Cash (COD Collected)</h6>
                                        <p><strong>Amount to Submit:</strong> ₹{order.floatingCashAmount || 0}</p>
                                        <p>Status: <CBadge color={getStatusColor(order.floatingCashStatus)}>{order.floatingCashStatus || 'Pending'}</CBadge></p>
                                        <CFormSelect
                                            value={order.floatingCashStatus || 'Pending'}
                                            onChange={(e) => handlePaymentStatusChange('floatingCash', e.target.value)}
                                            size="sm"
                                            style={{ maxWidth: 150 }}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Paid">Paid</option>
                                        </CFormSelect>
                                        <small className="text-muted d-block mt-1">
                                            Marking this as 'Paid' will deduct ₹{order.floatingCashAmount || 0} from Driver's floating debt.
                                        </small>
                                    </div>
                                )}
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            ) : (
                isAdmin && (
                    <CCard className="mb-4">
                        <CCardHeader><strong>Driver Details</strong></CCardHeader>
                        <CCardBody>No Driver Assigned</CCardBody>
                    </CCard>
                )
            )}

        </div>
    );
};

export default OrderDetails;
