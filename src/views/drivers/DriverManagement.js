import React, { useState, useEffect } from 'react'
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CForm,
    CFormInput,
    CFormLabel,
    CFormSelect,
    CRow,
    CAlert,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CNav,
    CNavItem,
    CNavLink,
    CTabContent,
    CTabPane,
} from '@coreui/react'
import { useDispatch } from 'react-redux'
import axiosInstance from '../../utils/axiosConfig'
import getAllDrivers from '../../api/driver/getAllDrivers'
import updateDriverStatus from '../../api/driver/updateDriverStatus'
import { startLoading, stopLoading } from '../../redux/actions/defaultActions'

const DriverManagement = () => {
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        plateNumber: '',
        type: 'bike',
    })
    const [documents, setDocuments] = useState([])
    const [drivers, setDrivers] = useState([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [activeTab, setActiveTab] = useState(1)

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

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleFileChange = (e) => {
        setDocuments(Array.from(e.target.files))
    }

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
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to update driver status')
            } finally {
                dispatch(stopLoading())
            }
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        const token = localStorage.getItem('token')
        const data = new FormData()

        data.append('personalDetails', JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            password: formData.password,
        }))

        data.append('vehicleDetails', JSON.stringify({
            plateNumber: formData.plateNumber,
            type: formData.type,
        }))

        documents.forEach((file) => {
            data.append('documents', file)
        })

        try {
            dispatch(startLoading())
            await axiosInstance.post('/create-driver', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            })
            setSuccess('Driver created successfully!')
            setFormData({ name: '', phone: '', password: '', plateNumber: '', type: 'bike' })
            setDocuments([])
            fetchDrivers()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create driver')
        } finally {
            dispatch(stopLoading())
        }
    }

    return (
        <CRow>
            <CCol xs={12}>
                <CCard className="mb-4">
                    <CCardHeader>
                        <strong>Driver Management (Admin Only)</strong>
                    </CCardHeader>
                    <CCardBody>
                        {error && <CAlert color="danger">{error}</CAlert>}
                        {success && <CAlert color="success">{success}</CAlert>}
                        <CForm onSubmit={handleSubmit}>
                            <CRow>
                                <CCol md={4} className="mb-3">
                                    <CFormLabel htmlFor="name">Name</CFormLabel>
                                    <CFormInput id="name" name="name" value={formData.name} onChange={handleChange} required />
                                </CCol>
                                <CCol md={4} className="mb-3">
                                    <CFormLabel htmlFor="phone">Phone</CFormLabel>
                                    <CFormInput id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
                                </CCol>
                                <CCol md={4} className="mb-3">
                                    <CFormLabel htmlFor="password">Password</CFormLabel>
                                    <CFormInput type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                                </CCol>
                            </CRow>
                            <CRow>
                                <CCol md={4} className="mb-3">
                                    <CFormLabel htmlFor="plateNumber">Vehicle Plate</CFormLabel>
                                    <CFormInput id="plateNumber" name="plateNumber" value={formData.plateNumber} onChange={handleChange} required />
                                </CCol>
                                <CCol md={4} className="mb-3">
                                    <CFormLabel htmlFor="type">Vehicle Type</CFormLabel>
                                    <CFormSelect id="type" name="type" value={formData.type} onChange={handleChange}>
                                        <option value="bike">Bike</option>
                                        <option value="scooter">Scooter</option>
                                    </CFormSelect>
                                </CCol>
                                <CCol md={4} className="mb-3">
                                    <CFormLabel htmlFor="documents">Documents (License/ID)</CFormLabel>
                                    <CFormInput type="file" id="documents" name="documents" multiple onChange={handleFileChange} />
                                </CCol>
                            </CRow>
                            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                <CButton color="primary" type="submit">Onboard Driver</CButton>
                            </div>
                        </CForm>

                        <hr className="my-4" />

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
                                    Pending / Suspended
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
                                                <CTableHeaderCell>Status</CTableHeaderCell>
                                                <CTableHeaderCell>Vehicle</CTableHeaderCell>
                                                <CTableHeaderCell>Actions</CTableHeaderCell>
                                            </CTableRow>
                                        </CTableHead>
                                        <CTableBody>
                                            {drivers.filter(d => d.approvalStatus === 'approved').length > 0 ? (
                                                drivers.filter(d => d.approvalStatus === 'approved').map((driver) => (
                                                    <CTableRow key={driver._id}>
                                                        <CTableDataCell>{driver.personalDetails?.name}</CTableDataCell>
                                                        <CTableDataCell>{driver.personalDetails?.phone}</CTableDataCell>
                                                        <CTableDataCell>
                                                            <span className="badge bg-success">approved</span>
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
                                            {drivers.filter(d => d.approvalStatus !== 'approved').length > 0 ? (
                                                drivers.filter(d => d.approvalStatus !== 'approved').map((driver) => (
                                                    <CTableRow key={driver._id}>
                                                        <CTableDataCell>{driver.personalDetails?.name}</CTableDataCell>
                                                        <CTableDataCell>{driver.personalDetails?.phone}</CTableDataCell>
                                                        <CTableDataCell>
                                                            <span className={`badge bg-${driver.approvalStatus === 'pending' ? 'warning' : 'danger'}`}>
                                                                {driver.approvalStatus}
                                                            </span>
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
                                                                <CButton
                                                                    size="sm"
                                                                    color="success"
                                                                    className="text-white"
                                                                    onClick={() => handleStatusToggle(driver._id, driver.approvalStatus)}
                                                                >
                                                                    Approve
                                                                </CButton>
                                                            </div>
                                                        </CTableDataCell>
                                                    </CTableRow>
                                                ))
                                            ) : (
                                                <CTableRow>
                                                    <CTableDataCell colSpan="5" className="text-center text-muted py-4">No pending or suspended drivers found.</CTableDataCell>
                                                </CTableRow>
                                            )}
                                        </CTableBody>
                                    </CTable>
                                </div>
                            </CTabPane>
                        </CTabContent>
                    </CCardBody>
                </CCard>
            </CCol>

            {/* Document Preview Modal */}
            <CModal visible={previewVisible} onClose={() => setPreviewVisible(false)} size="lg">
                <CModalHeader onClose={() => setPreviewVisible(false)}>
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
        </CRow>
    )
}

export default DriverManagement
