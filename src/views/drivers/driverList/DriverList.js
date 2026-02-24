import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CAlert,
} from '@coreui/react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import getAllDrivers from '../../../api/driver/getAllDrivers'
import updateDriverStatus from '../../../api/driver/updateDriverStatus'
import unblockDriver from '../../../api/driver/unblockDriver'
import { startLoading, stopLoading } from '../../../redux/actions/defaultActions'

const DriverList = () => {
    const dispatch = useDispatch()
    const [drivers, setDrivers] = useState([])
    const [activeTab, setActiveTab] = useState(1)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    // Modal states for preview
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewUrl, setPreviewUrl] = useState('')

    const fetchDrivers = async () => {
        try {
            const data = await getAllDrivers()
            setDrivers(data)
        } catch (error) {
            console.error('Failed to fetch drivers:', error)
        }
    }

    useEffect(() => {
        fetchDrivers()
    }, [])

    const handlePreview = (url) => {
        setPreviewUrl(url)
        setPreviewVisible(true)
    }

    const handleStatusToggle = async (driverId, currentStatus) => {
        const newStatus = currentStatus === 'approved' ? 'suspended' : 'approved'
        if (window.confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'suspend' : 'approve'} this driver?`)) {
            try {
                dispatch(startLoading())
                await updateDriverStatus(driverId, newStatus)
                setSuccess(`Driver ${newStatus === 'suspended' ? 'suspended' : 'approved'} successfully!`)
                fetchDrivers()
                setTimeout(() => setSuccess(''), 3000)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update driver status')
                setTimeout(() => setError(''), 3000)
            } finally {
                dispatch(stopLoading())
            }
        }
    }

    const handleUnblock = async (driverId) => {
        if (window.confirm('Unblock this driver and reset their rejection count?')) {
            try {
                dispatch(startLoading())
                await unblockDriver(driverId)
                setSuccess('Driver unblocked successfully!')
                fetchDrivers()
                setTimeout(() => setSuccess(''), 3000)
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to unblock driver')
                setTimeout(() => setError(''), 3000)
            } finally {
                dispatch(stopLoading())
            }
        }
    }

    return (
        <>
            <CCard className="mb-4">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Drivers Management</strong>
                    <Link to="/drivers/create">
                        <CButton color="primary" size="sm">
                            <CIcon icon={cilPlus} className="me-1" /> Add New Driver
                        </CButton>
                    </Link>
                </CCardHeader>
                <CCardBody>
                    {success && <CAlert color="success">{success}</CAlert>}
                    {error && <CAlert color="danger">{error}</CAlert>}

                    <CNav variant="tabs" className="mb-3">
                        <CNavItem>
                            <CNavLink
                                active={activeTab === 1}
                                onClick={() => setActiveTab(1)}
                                style={{ cursor: 'pointer' }}
                            >
                                Approved Drivers
                            </CNavLink>
                        </CNavItem>
                        <CNavItem>
                            <CNavLink
                                active={activeTab === 2}
                                onClick={() => setActiveTab(2)}
                                style={{ cursor: 'pointer' }}
                            >
                                Blocked / Suspended
                            </CNavLink>
                        </CNavItem>
                    </CNav>

                    <CTabContent>
                        <CTabPane visible={activeTab === 1}>
                            <div style={{ overflowX: 'auto' }}>
                                <CTable striped hover align="middle">
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Name</CTableHeaderCell>
                                            <CTableHeaderCell>Phone</CTableHeaderCell>
                                            <CTableHeaderCell>Vehicle</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            <CTableHeaderCell>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {drivers.filter(d => d.approvalStatus === 'approved' && !d.isBlocked).length > 0 ? (
                                            drivers.filter(d => d.approvalStatus === 'approved' && !d.isBlocked).map((driver) => (
                                                <CTableRow key={driver._id} style={driver.isBlocked ? { backgroundColor: '#fff5f5' } : {}}>
                                                    <CTableDataCell>{driver.personalDetails?.name}</CTableDataCell>
                                                    <CTableDataCell>{driver.personalDetails?.phone}</CTableDataCell>
                                                    <CTableDataCell>
                                                        {driver.vehicleDetails?.type} ({driver.vehicleDetails?.plateNumber})
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        {driver.isBlocked
                                                            ? <span className="badge bg-danger">🚫 Blocked ({driver.rejectionCount}/3)</span>
                                                            : <span className="badge bg-success">Active</span>}
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <div className="d-flex gap-2">
                                                            {driver.documents?.length > 0 && (
                                                                <CButton
                                                                    size="sm"
                                                                    color="info"
                                                                    className="text-white"
                                                                    onClick={() => handlePreview(driver.documents[0])}
                                                                >
                                                                    Docs
                                                                </CButton>
                                                            )}
                                                            {driver.isBlocked && (
                                                                <CButton
                                                                    size="sm"
                                                                    color="warning"
                                                                    className="text-white"
                                                                    onClick={() => handleUnblock(driver._id)}
                                                                >
                                                                    Unblock
                                                                </CButton>
                                                            )}
                                                            <CButton
                                                                size="sm"
                                                                color="danger"
                                                                className="text-white"
                                                                onClick={() => handleStatusToggle(driver._id, driver.approvalStatus)}
                                                            >
                                                                Suspend
                                                            </CButton>
                                                        </div>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        ) : (
                                            <CTableRow>
                                                <CTableDataCell colSpan="5" className="text-center text-muted py-4">No approved drivers found.</CTableDataCell>
                                            </CTableRow>
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>
                        </CTabPane>

                        <CTabPane visible={activeTab === 2}>
                            <div style={{ overflowX: 'auto' }}>
                                <CTable striped hover align="middle">
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Name</CTableHeaderCell>
                                            <CTableHeaderCell>Phone</CTableHeaderCell>
                                            <CTableHeaderCell>Status</CTableHeaderCell>
                                            <CTableHeaderCell>Vehicle</CTableHeaderCell>
                                            <CTableHeaderCell>Actions</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {drivers.filter(d => d.approvalStatus !== 'approved' || d.isBlocked).length > 0 ? (
                                            drivers.filter(d => d.approvalStatus !== 'approved' || d.isBlocked).map((driver) => (
                                                <CTableRow key={driver._id} style={driver.isBlocked ? { backgroundColor: '#fff5f5' } : {}}>
                                                    <CTableDataCell>{driver.personalDetails?.name}</CTableDataCell>
                                                    <CTableDataCell>{driver.personalDetails?.phone}</CTableDataCell>
                                                    <CTableDataCell>
                                                        {driver.isBlocked
                                                            ? <span className="badge bg-danger">🚫 Blocked ({driver.rejectionCount}/3 rejections)</span>
                                                            : <span className={`badge bg-${driver.approvalStatus === 'pending' ? 'warning' : 'danger'}`}>{driver.approvalStatus}</span>
                                                        }
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        {driver.vehicleDetails?.type} ({driver.vehicleDetails?.plateNumber})
                                                    </CTableDataCell>
                                                    <CTableDataCell>
                                                        <div className="d-flex gap-2">
                                                            {driver.documents?.length > 0 && (
                                                                <CButton
                                                                    size="sm"
                                                                    color="info"
                                                                    className="text-white"
                                                                    onClick={() => handlePreview(driver.documents[0])}
                                                                >
                                                                    Docs
                                                                </CButton>
                                                            )}
                                                            {driver.isBlocked ? (
                                                                <CButton
                                                                    size="sm"
                                                                    color="warning"
                                                                    className="text-white"
                                                                    onClick={() => handleUnblock(driver._id)}
                                                                >
                                                                    Unblock
                                                                </CButton>
                                                            ) : (
                                                                <CButton
                                                                    size="sm"
                                                                    color="success"
                                                                    className="text-white"
                                                                    onClick={() => handleStatusToggle(driver._id, driver.approvalStatus)}
                                                                >
                                                                    Approve
                                                                </CButton>
                                                            )}
                                                        </div>
                                                    </CTableDataCell>
                                                </CTableRow>
                                            ))
                                        ) : (
                                            <CTableRow>
                                                <CTableDataCell colSpan="5" className="text-center text-muted py-4">No blocked or suspended drivers found.</CTableDataCell>
                                            </CTableRow>
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>
                        </CTabPane>
                    </CTabContent>
                </CCardBody>
            </CCard>

            {/* Document Preview Modal */}
            <CModal visible={previewVisible} onClose={() => setPreviewVisible(false)} size="lg">
                <CModalHeader>
                    <CModalTitle>Document Preview</CModalTitle>
                </CModalHeader>
                <CModalBody className="text-center">
                    {previewUrl && (
                        previewUrl.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={previewUrl} title="Document Preview" width="100%" height="500px"></iframe>
                        ) : (
                            <img src={previewUrl} alt="Document" style={{ maxWidth: '100%', height: 'auto' }} />
                        )
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setPreviewVisible(false)}>
                        Close
                    </CButton>
                    <CButton color="primary" onClick={() => window.open(previewUrl, '_blank')}>
                        Open in New Tab
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default DriverList
