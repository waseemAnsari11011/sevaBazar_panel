import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import getAllVendors from '../../../api/vendor/getAllVendor'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBan, cilLockUnlocked, cilNotes } from '@coreui/icons'
import { restrictVendor, unRestrictVendor } from '../../../api/vendor/restrictUnrestrict'
import { startLoading, stopLoading } from '../../../redux/actions/defaultActions'

const VendorList = () => {
  const dispatch = useDispatch()
  const [vendors, setVendors] = useState([])
  const [alertMessage, setAlertMessage] = useState('')
  const [alertVisible, setAlertVisible] = useState(false)
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      if (user && user.role) {
        setUserRole(user.role)
      }
    } catch (error) {
      console.error('Failed to parse user data from localStorage', error)
    }
  }, [])

  useEffect(() => {
    let timeout
    if (alertVisible) {
      timeout = setTimeout(() => {
        setAlertVisible(false)
      }, 1000) // Hide alert after 1 second
    }
    return () => clearTimeout(timeout)
  }, [alertVisible])

  const fetchVendors = async () => {
    try {
      dispatch(startLoading())
      const vendorsData = await getAllVendors()
      setVendors(vendorsData)
    } catch (error) {
      console.error('Failed to fetch vendors:', error)
    } finally {
      dispatch(stopLoading())
    }
  }

  useEffect(() => {
    fetchVendors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUnRestrict = async (vendorId) => {
    try {
      await unRestrictVendor(vendorId)
      setAlertMessage('Unrestricted Successfully')
      setAlertVisible(true)
      fetchVendors()
    } catch (error) {
      console.error(error)
    }
  }

  const handleRestrict = async (vendorId) => {
    try {
      await restrictVendor(vendorId)
      setAlertMessage('Restricted Successfully')
      setAlertVisible(true)
      fetchVendors()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      {alertVisible && (
        <CAlert color={'success'} onClose={() => setAlertVisible(false)} dismissible>
          {alertMessage}
        </CAlert>
      )}
      <CTable striped hover>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell>Phone</CTableHeaderCell>
            <CTableHeaderCell>Serviceable Pincodes</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {vendors.map((vendor) => (
            <CTableRow key={vendor._id}>
              <CTableDataCell>{vendor.name || 'N/A'}</CTableDataCell>
              <CTableDataCell>{vendor.email}</CTableDataCell>
              <CTableDataCell>{vendor.vendorInfo.contactNumber}</CTableDataCell>
              <CTableDataCell>
                {vendor.location?.address?.postalCodes?.join(', ') || 'N/A'}
              </CTableDataCell>
              <CTableDataCell>
                <div className="d-flex">
                  {userRole === 'admin' && (
                    <Link to={`/vendors/details/${vendor._id}`}>
                      <CButton color="info" className="me-2" size="sm">
                        <CIcon icon={cilNotes} className="me-1" /> View Details
                      </CButton>
                    </Link>
                  )}
                  {!vendor.isRestricted ? (
                    <CButton
                      color="danger"
                      size="sm"
                      onClick={() => handleRestrict(vendor._id)}
                      title="Restrict Vendor"
                    >
                      <CIcon icon={cilBan} />
                    </CButton>
                  ) : (
                    <CButton
                      color="warning"
                      size="sm"
                      onClick={() => handleUnRestrict(vendor._id)}
                      title="Un-restrict Vendor"
                    >
                      <CIcon icon={cilLockUnlocked} />
                    </CButton>
                  )}
                </div>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default VendorList
