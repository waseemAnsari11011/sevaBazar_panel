import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CFormInput,
    CSpinner,
    CBadge,
    CButtonGroup,
    CButton,
    CFormLabel,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react'
import {
    getAllVendorsEarnings,
    getVendorEarningsDetails,
    bulkUpdateVendorPaymentStatus,
    updateSingleOrderPaymentStatus
} from '../../../api/report/salesReports'
import Swal from 'sweetalert2'

const VendorEarnings = () => {
    const [earnings, setEarnings] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('today') // today, yesterday, total, custom
    const [customDates, setCustomDates] = useState({ start: '', end: '' })

    // Modal state
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedVendor, setSelectedVendor] = useState(null)
    const [orderDetails, setOrderDetails] = useState([])
    const [detailsLoading, setDetailsLoading] = useState(false)

    const getDateRange = (filterType, customRange) => {
        const now = new Date()
        let startDate = new Date()
        let endDate = new Date()

        switch (filterType) {
            case 'today':
                startDate.setHours(0, 0, 0, 0)
                endDate.setHours(23, 59, 59, 999)
                break
            case 'yesterday':
                startDate.setDate(now.getDate() - 1)
                startDate.setHours(0, 0, 0, 0)
                endDate.setDate(now.getDate() - 1)
                endDate.setHours(23, 59, 59, 999)
                break
            case 'custom':
                if (customRange.start && customRange.end) {
                    startDate = new Date(customRange.start)
                    startDate.setHours(0, 0, 0, 0)
                    endDate = new Date(customRange.end)
                    endDate.setHours(23, 59, 59, 999)
                } else {
                    return null
                }
                break
            case 'total':
            default:
                return null
        }

        return {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        }
    }

    const fetchEarnings = async () => {
        try {
            setLoading(true)
            const dateRange = getDateRange(filter, customDates)
            const params = { ...dateRange, dateField: 'deliveredAt' }
            const data = await getAllVendorsEarnings(params)
            setEarnings(data)
        } catch (error) {
            console.error('Failed to fetch vendor earnings:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEarnings()
    }, [filter, customDates.start, customDates.end])

    const fetchOrderDetails = async (vendor) => {
        try {
            setDetailsLoading(true)
            setSelectedVendor(vendor)
            const dateRange = getDateRange(filter, customDates)
            const params = { ...dateRange, dateField: 'deliveredAt' }
            const data = await getVendorEarningsDetails(vendor.vendorId, params)
            setOrderDetails(data)
            setModalVisible(true)
        } catch (error) {
            console.error('Failed to fetch order details:', error)
        } finally {
            setDetailsLoading(false)
        }
    }

    const handleUpdatePaymentStatus = async (vendor) => {
        if (vendor.pendingEarnings <= 0) return

        const { value: file } = await Swal.fire({
            title: 'Mark as Paid?',
            text: `Do you want to mark ₹${vendor.pendingEarnings} as PAID for ${vendor.name}?`,
            icon: 'question',
            input: 'file',
            inputAttributes: {
                'accept': 'image/*,application/pdf',
                'aria-label': 'Upload the bill/receipt'
            },
            inputPlaceholder: 'Optional: Upload bill/receipt (Image or PDF)',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, mark as Paid!',
        })

        if (file !== undefined) {
            try {
                setLoading(true)
                const range = getDateRange(filter, customDates)
                const formData = new FormData()
                formData.append('vendorId', vendor.vendorId)
                formData.append('status', 'Paid')
                formData.append('dateField', 'deliveredAt')
                if (range?.startDate) formData.append('startDate', range.startDate)
                if (range?.endDate) formData.append('endDate', range.endDate)
                if (file) {
                    formData.append('billFile', file)
                }

                await bulkUpdateVendorPaymentStatus(formData)

                Swal.fire('Updated!', 'Payment status has been updated to Paid.', 'success')
                fetchEarnings() // Refresh list
            } catch (error) {
                console.error('Failed to update payment status:', error)
                Swal.fire('Error!', 'Failed to update payment status.', 'error')
            } finally {
                setLoading(false)
            }
        }
    }

    const toggleSingleOrderPayment = async (order) => {
        const newStatus = order.paymentStatus === 'Paid' ? 'Pending' : 'Paid'
        try {
            await updateSingleOrderPaymentStatus({
                orderId: order._id,
                type: order.type,
                status: newStatus
            })
            // Update local state for immediate feedback
            setOrderDetails(prev => prev.map(o => o._id === order._id ? { ...o, paymentStatus: newStatus } : o))
            fetchEarnings() // Silently refresh the main table in background
        } catch (error) {
            console.error('Failed to update single order status:', error)
            Swal.fire('Error!', 'Failed to update status.', 'error')
        }
    }

    const filteredEarnings = earnings.filter(
        (item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.businessName.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleCustomDateChange = (e) => {
        setCustomDates({ ...customDates, [e.target.name]: e.target.value })
    }

    // Modal Summaries
    const modalPendingTotal = orderDetails.reduce((acc, curr) => curr.paymentStatus === 'Paid' ? acc : acc + curr.amount, 0)
    const modalPaidTotal = orderDetails.reduce((acc, curr) => curr.paymentStatus === 'Paid' ? acc + curr.amount : acc, 0)

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4 shadow-sm border-0">
                    <CCardHeader className="bg-white border-bottom-0 pb-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="mb-0">Vendor Earnings & Payments</h4>
                            <CButtonGroup>
                                <CButton
                                    color="primary"
                                    variant={filter === 'today' ? 'solid' : 'outline'}
                                    onClick={() => setFilter('today')}
                                >
                                    Today
                                </CButton>
                                <CButton
                                    color="primary"
                                    variant={filter === 'yesterday' ? 'solid' : 'outline'}
                                    onClick={() => setFilter('yesterday')}
                                >
                                    Yesterday
                                </CButton>
                                <CButton
                                    color="primary"
                                    variant={filter === 'custom' ? 'solid' : 'outline'}
                                    onClick={() => setFilter('custom')}
                                >
                                    Date Range
                                </CButton>
                                <CButton
                                    color="primary"
                                    variant={filter === 'total' ? 'solid' : 'outline'}
                                    onClick={() => setFilter('total')}
                                >
                                    All Time
                                </CButton>
                            </CButtonGroup>
                        </div>
                    </CCardHeader>
                    <CCardBody>
                        <CRow className="mb-4 g-3 align-items-end">
                            <CCol md={filter === 'custom' ? 4 : 12}>
                                <CFormLabel>Search Vendor</CFormLabel>
                                <CFormInput
                                    type="text"
                                    placeholder="Search by vendor or business name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </CCol>
                            {filter === 'custom' && (
                                <>
                                    <CCol md={4}>
                                        <CFormLabel>Start Date</CFormLabel>
                                        <CFormInput
                                            type="date"
                                            name="start"
                                            value={customDates.start}
                                            onChange={handleCustomDateChange}
                                        />
                                    </CCol>
                                    <CCol md={4}>
                                        <CFormLabel>End Date</CFormLabel>
                                        <CFormInput
                                            type="date"
                                            name="end"
                                            value={customDates.end}
                                            onChange={handleCustomDateChange}
                                        />
                                    </CCol>
                                </>
                            )}
                        </CRow>

                        {loading ? (
                            <div className="text-center p-5">
                                <CSpinner color="primary" />
                                <div className="mt-2 text-muted">Calculating earnings...</div>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <CTable hover striped responsive align="middle">
                                    <CTableHead className="bg-light">
                                        <CTableRow>
                                            <CTableHeaderCell>Vendor / Business</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Orders</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Total Earnings</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Already Paid</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Amount to Pay</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {filteredEarnings.map((item) => (
                                            <CTableRow key={item.vendorId}>
                                                <CTableDataCell>
                                                    <div><strong>{item.name}</strong></div>
                                                    <div className="small text-medium-emphasis">{item.businessName}</div>
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <CButton
                                                        color="info"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="p-0"
                                                        onClick={() => fetchOrderDetails(item)}
                                                    >
                                                        <CBadge color="info" shape="rounded-pill" style={{ cursor: 'pointer', padding: '6px 10px' }}>
                                                            {item.totalOrders}
                                                        </CBadge>
                                                    </CButton>
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <strong>₹{item.totalEarnings}</strong>
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center text-success">
                                                    ₹{item.paidEarnings}
                                                </CTableDataCell>
                                                <CTableDataCell className="text-center">
                                                    <CBadge
                                                        color={item.pendingEarnings > 0 ? 'warning' : 'success'}
                                                        shape="rounded-pill"
                                                        style={{
                                                            fontSize: '14px',
                                                            padding: '8px 12px',
                                                            minWidth: '80px',
                                                            cursor: item.pendingEarnings > 0 ? 'pointer' : 'default'
                                                        }}
                                                        onClick={() => handleUpdatePaymentStatus(item)}
                                                    >
                                                        ₹{item.pendingEarnings}
                                                    </CBadge>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                        {filteredEarnings.length === 0 && (
                                            <CTableRow>
                                                <CTableDataCell colSpan="5" className="text-center py-5 text-muted">
                                                    No records found for the selected period.
                                                </CTableDataCell>
                                            </CTableRow>
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>
                        )}
                    </CCardBody>
                </CCard>

                {/* Order Details Modal */}
                <CModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    size="lg"
                    backdrop="static"
                >
                    <CModalHeader>
                        <CModalTitle>
                            Orders Details - {selectedVendor?.name}
                            <div className="small text-muted">{selectedVendor?.businessName}</div>
                        </CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <CBadge color="info" variant="outline" className="me-2">Total Orders: {orderDetails.length}</CBadge>
                                {modalPendingTotal > 0 && (
                                    <CButton
                                        color="warning"
                                        size="sm"
                                        onClick={() => handleUpdatePaymentStatus(selectedVendor)}
                                    >
                                        Pay All Pending (₹{modalPendingTotal})
                                    </CButton>
                                )}
                            </div>
                        </div>
                        {detailsLoading ? (
                            <div className="text-center p-4">
                                <CSpinner color="primary" />
                            </div>
                        ) : (
                            <CTable hover striped responsive align="middle">
                                <CTableHead className="bg-light">
                                    <CTableRow>
                                        <CTableHeaderCell>Order ID</CTableHeaderCell>
                                        <CTableHeaderCell>Date</CTableHeaderCell>
                                        <CTableHeaderCell>Type</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center">Amount</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center">Bill</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center">Status</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {orderDetails.map((order) => (
                                        <CTableRow key={order._id}>
                                            <CTableDataCell><strong>#{order.orderId}</strong></CTableDataCell>
                                            <CTableDataCell>
                                                {new Date(order.deliveredAt || order.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                                <div className="small text-muted">
                                                    {new Date(order.deliveredAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge color={order.type === 'Normal' ? 'secondary' : 'dark'} variant="outline">
                                                    {order.type}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center">₹{order.amount}</CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                {order.vendorBillFile ? (
                                                    <CButton
                                                        color="info"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(order.vendorBillFile, '_blank')}
                                                        title="View Bill File"
                                                    >
                                                        View
                                                    </CButton>
                                                ) : (
                                                    <span className="text-muted small">-</span>
                                                )}
                                            </CTableDataCell>
                                            <CTableDataCell className="text-center">
                                                <CBadge
                                                    color={order.paymentStatus === 'Paid' ? 'success' : 'warning'}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => toggleSingleOrderPayment(order)}
                                                >
                                                    {order.paymentStatus}
                                                </CBadge>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                                <CTableHead className="bg-light">
                                    <CTableRow>
                                        <CTableHeaderCell colSpan="3" className="text-end">Summary:</CTableHeaderCell>
                                        <CTableHeaderCell className="text-center">
                                            <div className="text-success small">Paid: ₹{modalPaidTotal}</div>
                                            <div className="text-warning small">Pending: ₹{modalPendingTotal}</div>
                                            <hr className="my-1" />
                                            <strong>₹{modalPaidTotal + modalPendingTotal}</strong>
                                        </CTableHeaderCell>
                                        <CTableHeaderCell></CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                            </CTable>
                        )}
                        {orderDetails.length === 0 && !detailsLoading && (
                            <div className="text-center py-4 text-muted">
                                No delivered orders found in this period.
                            </div>
                        )}
                    </CModalBody>
                    <CModalFooter>
                        <CButton color="secondary" onClick={() => setModalVisible(false)}>
                            Close
                        </CButton>
                    </CModalFooter>
                </CModal>
            </CCol>
        </CRow>
    )
}

export default VendorEarnings
