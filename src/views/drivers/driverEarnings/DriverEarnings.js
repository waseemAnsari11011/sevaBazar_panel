import React, { useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CButton,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormInput,
    CFormLabel,
    CSpinner,
    CBadge,
    CAlert,
    CButtonGroup,
} from '@coreui/react'
import { useDispatch } from 'react-redux'
import {
    getAllDriversEarnings,
    getDriverEarningsDetails,
    bulkUpdateDriverPaymentStatus,
    updateSingleOrderPaymentStatus
} from '../../../api/report/salesReports'
import { startLoading, stopLoading } from '../../../redux/actions/defaultActions'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

const DriverEarnings = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [earningsData, setEarningsData] = useState([])
    const [loading, setLoading] = useState(false)
    const [detailsModalVisible, setDetailsModalVisible] = useState(false)
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [driverDetails, setDriverDetails] = useState([])
    const [detailsLoading, setDetailsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [searchTerm, setSearchTerm] = useState('')
    const [filter, setFilter] = useState('today') // today, yesterday, total, custom
    const [customDates, setCustomDates] = useState({ start: '', end: '' })

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
            const data = await getAllDriversEarnings(params)
            setEarningsData(data)
        } catch (err) {
            setError('Failed to fetch driver earnings')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchEarnings()
    }, [filter, customDates.start, customDates.end])

    const handleViewDetails = async (driver) => {
        setSelectedDriver(driver)
        setDetailsModalVisible(true)
        setDetailsLoading(true)
        try {
            const dateRange = getDateRange(filter, customDates)
            const params = { ...dateRange, dateField: 'deliveredAt' }
            const data = await getDriverEarningsDetails(driver.driverId, params)
            setDriverDetails(data)
        } catch (err) {
            setError('Failed to fetch details')
        } finally {
            setDetailsLoading(false)
        }
    }

    const handleUpdatePaymentStatus = async (orderId, type, status) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to mark this as ${status}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, mark as ${status}!`,
        })

        if (result.isConfirmed) {
            try {
                dispatch(startLoading())
                await updateSingleOrderPaymentStatus({ orderId, type, status })
                Swal.fire('Updated!', 'Status has been updated.', 'success')
                if (selectedDriver) {
                    const data = await getDriverEarningsDetails(selectedDriver.driverId, filters)
                    setDriverDetails(data)
                }
                fetchEarnings()
            } catch (err) {
                Swal.fire('Error!', 'Failed to update status.', 'error')
            } finally {
                dispatch(stopLoading())
            }
        }
    }

    const handleBulkUpdate = async (type, status) => {
        if (!selectedDriver) return
        const label = type === 'earning' ? 'Earnings' : 'Floating Cash'

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Mark ALL ${label} as ${status} for this driver in selected date range?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, mark all as ${status}!`,
        })

        if (result.isConfirmed) {
            try {
                dispatch(startLoading())
                const range = getDateRange(filter, customDates)
                await bulkUpdateDriverPaymentStatus({
                    driverId: selectedDriver.driverId,
                    startDate: range?.startDate,
                    endDate: range?.endDate,
                    status,
                    type
                })
                Swal.fire('Updated!', 'Bulk status updated successfully.', 'success')
                const params = { ...range, dateField: 'deliveredAt' }
                const data = await getDriverEarningsDetails(selectedDriver.driverId, params)
                setDriverDetails(data)
                fetchEarnings()
            } catch (err) {
                Swal.fire('Error!', 'Bulk update failed.', 'error')
            } finally {
                dispatch(stopLoading())
            }
        }
    }

    const handleBulkUpdateFromTable = async (driver, type) => {
        const amount = type === 'earning' ? driver.pendingEarnings : driver.pendingFloatingCash;
        const label = type === 'earning' ? 'Earnings' : 'Floating Cash';
        const action = type === 'earning' ? 'paid to driver' : 'recovered from driver';

        const result = await Swal.fire({
            title: 'Confirm Payment Reconcilation',
            text: `Mark ₹${amount} of ${label} as ${action} for ${driver.name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2eb85c',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, I confirmed!',
        })

        if (result.isConfirmed) {
            try {
                dispatch(startLoading())
                const range = getDateRange(filter, customDates)
                await bulkUpdateDriverPaymentStatus({
                    driverId: driver.driverId,
                    startDate: range?.startDate,
                    endDate: range?.endDate,
                    status: 'Paid',
                    type
                })
                Swal.fire('Success!', `${label} settled for ${driver.name}.`, 'success')
                fetchEarnings()
            } catch (err) {
                Swal.fire('Error!', 'Update failed.', 'error')
            } finally {
                dispatch(stopLoading())
            }
        }
    }

    // Modal Summaries
    const modalPaidEarnings = driverDetails.reduce((acc, curr) => curr.earningStatus === 'Paid' ? acc + (curr.earningAmount || 0) : acc, 0)
    const modalPendingEarnings = driverDetails.reduce((acc, curr) => curr.earningStatus !== 'Paid' ? acc + (curr.earningAmount || 0) : acc, 0)
    const modalPaidCash = driverDetails.reduce((acc, curr) => curr.cashStatus === 'Paid' ? acc + (curr.cashAmount || 0) : acc, 0)
    const modalPendingCash = driverDetails.reduce((acc, curr) => curr.cashStatus !== 'Paid' ? acc + (curr.cashAmount || 0) : acc, 0)

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4 shadow-sm border-0">
                    <CCardHeader className="bg-white border-bottom-0 pb-0">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="mb-0">Driver Earnings & Payments</h4>
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
                                <CFormLabel>Search Driver</CFormLabel>
                                <CFormInput
                                    type="text"
                                    placeholder="Search by driver name or phone..."
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
                                            value={customDates.start}
                                            onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                                        />
                                    </CCol>
                                    <CCol md={4}>
                                        <CFormLabel>End Date</CFormLabel>
                                        <CFormInput
                                            type="date"
                                            value={customDates.end}
                                            onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                                        />
                                    </CCol>
                                </>
                            )}
                        </CRow>
                        {error && <CAlert color="danger">{error}</CAlert>}
                        {success && <CAlert color="success">{success}</CAlert>}

                        {loading ? (
                            <div className="text-center py-5">
                                <CSpinner color="primary" />
                                <div className="mt-2 text-muted">Calculating earnings...</div>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <CTable hover striped responsive align="middle">
                                    <CTableHead className="bg-light">
                                        <CTableRow>
                                            <CTableHeaderCell>Driver</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Orders</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Earnings (Total)</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Earnings (Pending)</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Cash (Already Paid)</CTableHeaderCell>
                                            <CTableHeaderCell className="text-center">Cash (To Recover)</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {earningsData
                                            .filter(item =>
                                                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                item.phone.includes(searchTerm)
                                            )
                                            .length > 0 ? (
                                            earningsData
                                                .filter(item =>
                                                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    item.phone.includes(searchTerm)
                                                )
                                                .map((item) => (
                                                    <CTableRow key={item.driverId}>
                                                        <CTableDataCell>
                                                            <div><strong>{item.name}</strong></div>
                                                            <div className="small text-medium-emphasis">{item.phone}</div>
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-center">
                                                            <CButton
                                                                color="info"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="p-0"
                                                                onClick={() => handleViewDetails(item)}
                                                            >
                                                                <CBadge color="info" shape="rounded-pill" style={{ cursor: 'pointer', padding: '6px 10px' }}>
                                                                    {item.totalOrders}
                                                                </CBadge>
                                                            </CButton>
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-center"><strong>₹{item.totalEarnings}</strong></CTableDataCell>
                                                        <CTableDataCell className="text-center">
                                                            <CBadge
                                                                color="danger"
                                                                shape="rounded-pill"
                                                                style={{ cursor: item.pendingEarnings > 0 ? 'pointer' : 'default', padding: '8px 12px', minWidth: '80px', fontSize: '14px' }}
                                                                onClick={() => item.pendingEarnings > 0 && handleBulkUpdateFromTable(item, 'earning')}
                                                            >
                                                                ₹{item.pendingEarnings}
                                                            </CBadge>
                                                        </CTableDataCell>
                                                        <CTableDataCell className="text-center text-success">₹{item.paidFloatingCash}</CTableDataCell>
                                                        <CTableDataCell className="text-center">
                                                            <CBadge
                                                                color="warning"
                                                                shape="rounded-pill"
                                                                style={{ cursor: item.pendingFloatingCash > 0 ? 'pointer' : 'default', padding: '8px 12px', minWidth: '80px', fontSize: '14px' }}
                                                                onClick={() => item.pendingFloatingCash > 0 && handleBulkUpdateFromTable(item, 'cash')}
                                                            >
                                                                ₹{item.pendingFloatingCash}
                                                            </CBadge>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                ))
                                        ) : (
                                            <CTableRow>
                                                <CTableDataCell colSpan="6" className="text-center py-5 text-muted">No records found for the selected period.</CTableDataCell>
                                            </CTableRow>
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>
                        )}
                    </CCardBody>
                </CCard>
            </CCol>

            {/* Details Modal */}
            <CModal visible={detailsModalVisible} onClose={() => setDetailsModalVisible(false)} size="lg" backdrop="static">
                <CModalHeader>
                    <CModalTitle>
                        Orders Details - {selectedDriver?.name}
                        <div className="small text-muted">{selectedDriver?.phone}</div>
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2">
                            <CBadge color="info" variant="outline">Total Orders: {driverDetails.length}</CBadge>
                            {modalPendingEarnings > 0 && (
                                <CButton size="sm" color="success" onClick={() => handleBulkUpdate('earning', 'Paid')}>
                                    Pay All Earnings (₹{modalPendingEarnings})
                                </CButton>
                            )}
                            {modalPendingCash > 0 && (
                                <CButton size="sm" color="warning" onClick={() => handleBulkUpdate('cash', 'Paid')}>
                                    Recover All Cash (₹{modalPendingCash})
                                </CButton>
                            )}
                        </div>
                    </div>

                    {detailsLoading ? (
                        <div className="text-center py-4"><CSpinner color="primary" /></div>
                    ) : (
                        <CTable hover striped responsive align="middle">
                            <CTableHead className="bg-light">
                                <CTableRow>
                                    <CTableHeaderCell>Order ID</CTableHeaderCell>
                                    <CTableHeaderCell>Date</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">Earning</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">Cash</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">Action</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {driverDetails.map((order) => (
                                    <CTableRow key={order._id}>
                                        <CTableDataCell>
                                            <strong>#{order.orderId}</strong>
                                            <div>
                                                <CBadge color={order.type === 'Normal' ? 'secondary' : 'dark'} variant="outline" className="mt-1">
                                                    {order.type}
                                                </CBadge>
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            {new Date(order.deliveredAt || order.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                            <div className="small text-muted">
                                                {new Date(order.deliveredAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-center">
                                            <div>₹{order.earningAmount}</div>
                                            <CBadge
                                                color={order.earningStatus === 'Paid' ? 'success' : 'danger'}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleUpdatePaymentStatus(order._id, 'driverEarning', order.earningStatus === 'Paid' ? 'Pending' : 'Paid')}
                                            >
                                                {order.earningStatus || 'Pending'}
                                            </CBadge>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-center">
                                            <div>₹{order.cashAmount}</div>
                                            <CBadge
                                                color={order.cashStatus === 'Paid' ? 'success' : 'warning'}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleUpdatePaymentStatus(order._id, 'floatingCash', order.cashStatus === 'Paid' ? 'Pending' : 'Paid')}
                                            >
                                                {order.cashStatus || 'Pending'}
                                            </CBadge>
                                        </CTableDataCell>
                                        <CTableDataCell className="text-center">
                                            <CButton
                                                color="primary"
                                                size="sm"
                                                onClick={() => navigate(`/orders/order-details/${order._id}`)}
                                            >
                                                View Detail
                                            </CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                            <CTableHead className="bg-light">
                                <CTableRow>
                                    <CTableHeaderCell colSpan="2" className="text-end">Summary:</CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">
                                        <div className="text-success small">Paid: ₹{modalPaidEarnings}</div>
                                        <div className="text-danger small">Pending: ₹{modalPendingEarnings}</div>
                                        <hr className="my-1" />
                                        <strong>₹{modalPaidEarnings + modalPendingEarnings}</strong>
                                    </CTableHeaderCell>
                                    <CTableHeaderCell className="text-center">
                                        <div className="text-success small">Recovered: ₹{modalPaidCash}</div>
                                        <div className="text-warning small">Debt: ₹{modalPendingCash}</div>
                                        <hr className="my-1" />
                                        <strong>₹{modalPaidCash + modalPendingCash}</strong>
                                    </CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                        </CTable>
                    )}
                    {driverDetails.length === 0 && !detailsLoading && (
                        <div className="text-center py-4 text-muted">No orders found.</div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setDetailsModalVisible(false)}>
                        Close
                    </CButton>
                </CModalFooter>
            </CModal>
        </CRow>
    )
}

export default DriverEarnings
