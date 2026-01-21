import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import getAllDrivers from '../../../api/driver/getAllDrivers'
import { useDispatch } from 'react-redux'
import {
    CButton,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CAlert,
    CCard,
    CCardHeader,
    CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { startLoading, stopLoading } from '../../../redux/actions/defaultActions'

const DriverList = () => {
    const dispatch = useDispatch()
    const [drivers, setDrivers] = useState([])
    const [alertMessage, setAlertMessage] = useState('')
    const [alertVisible, setAlertVisible] = useState(false)

    const fetchDrivers = async () => {
        try {
            dispatch(startLoading())
            const data = await getAllDrivers()
            setDrivers(data)
        } catch (error) {
            console.error('Failed to fetch drivers:', error)
        } finally {
            dispatch(stopLoading())
        }
    }

    useEffect(() => {
        fetchDrivers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <CCard>
            <CCardHeader className="d-flex justify-content-between align-items-center">
                <strong>Drivers List</strong>
                <Link to="/drivers/create">
                    <CButton color="primary" size="sm">
                        <CIcon icon={cilPlus} className="me-1" /> Onboard Driver
                    </CButton>
                </Link>
            </CCardHeader>
            <CCardBody>
                {alertVisible && (
                    <CAlert color={'success'} onClose={() => setAlertVisible(false)} dismissible>
                        {alertMessage}
                    </CAlert>
                )}
                <div style={{ overflowX: 'auto' }}>
                    <CTable striped hover>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Name</CTableHeaderCell>
                                <CTableHeaderCell>Phone</CTableHeaderCell>
                                <CTableHeaderCell>Vehicle Plate</CTableHeaderCell>
                                <CTableHeaderCell>Vehicle Type</CTableHeaderCell>
                                <CTableHeaderCell>Status</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {drivers.length > 0 ? (
                                drivers.map((driver) => (
                                    <CTableRow key={driver._id}>
                                        <CTableDataCell>{driver.personalDetails?.name || 'N/A'}</CTableDataCell>
                                        <CTableDataCell>{driver.personalDetails?.phone || 'N/A'}</CTableDataCell>
                                        <CTableDataCell>{driver.vehicleDetails?.plateNumber || 'N/A'}</CTableDataCell>
                                        <CTableDataCell>{driver.vehicleDetails?.type || 'N/A'}</CTableDataCell>
                                        <CTableDataCell>{driver.approvalStatus || 'N/A'}</CTableDataCell>
                                    </CTableRow>
                                ))
                            ) : (
                                <CTableRow>
                                    <CTableDataCell colSpan="5" className="text-center">No drivers found.</CTableDataCell>
                                </CTableRow>
                            )}
                        </CTableBody>
                    </CTable>
                </div>
            </CCardBody>
        </CCard>
    )
}

export default DriverList
