import { useCallback, useState, useEffect } from 'react';
import getAllVendors from '../../../api/vendor/getAllVendor';
import { startLoading, stopLoading } from '../../../store';
import { useDispatch } from 'react-redux';
import {
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CSpinner,
  CAlert

} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilCloudUpload, cilBan, cilLockUnlocked } from '@coreui/icons'
import { restrictVendor, unRestrictVendor } from '../../../api/vendor/restrictUnrestrict';

const VendorList = () => {
  const dispatch = useDispatch()
  const [vendors, setVendors] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);

  console.log("vendors--->", vendors)

  useEffect(() => {
    let timeout;
    if (alertVisible) {
      timeout = setTimeout(() => {
        setAlertVisible(false);
      }, 1000); // Hide alert after 5 seconds (adjust as needed)
    }
    return () => clearTimeout(timeout);
  }, [alertVisible]);


  const fetchVendors = async () => {
    try {
      dispatch(startLoading())
      const vendorsData = await getAllVendors();
      setVendors(vendorsData);
      dispatch(stopLoading())
    } catch (error) {
      dispatch(stopLoading())
      console.error('Failed to fetch vendors:', error);
    }
  };
  useEffect(() => {

    fetchVendors();
  }, []);

  const handleUnRestrict = async (vendorId) => {
    try {
      await unRestrictVendor(vendorId)
      setAlertMessage('Unrestricted Successfully')
      setAlertVisible(true)
      fetchVendors();
    } catch (error) {
    }
  }

  const handleRestrict = async (vendorId) => {
    try {
      await restrictVendor(vendorId)
      setAlertMessage('restricted Successfully')
      setAlertVisible(true)
      fetchVendors();
    } catch (error) {
    }
  }


  return (
    <div style={{ overflowX: 'auto' }}>
      {alertVisible && (
        <CAlert color={'success'} onClose={() => setAlertVisible(false)} dismissible>
          {alertMessage}
        </CAlert>
      )}
      <CTable striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>Name</CTableHeaderCell>
            <CTableHeaderCell>Email</CTableHeaderCell>
            <CTableHeaderCell>Phone</CTableHeaderCell>
            <CTableHeaderCell>Available Localities</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {vendors.map((vendor, index) => (
            <CTableRow key={index}>

              <CTableDataCell>{vendor.name}</CTableDataCell>
              <CTableDataCell>{vendor.email}</CTableDataCell>
              <CTableDataCell>{vendor.vendorInfo.contactNumber}</CTableDataCell>
              <CTableDataCell>{vendor?.availableLocalities?.[0]}</CTableDataCell>
              <CTableDataCell >
                <div className='actions-cell'>
                  {!vendor.isRestricted ? <CButton style={{ margin: '0.25rem' }} disabled color="warning" onClick={() => handleUnRestrict(vendor._id)}>
                    <CIcon icon={cilLockUnlocked} />
                  </CButton> : <CButton style={{ margin: '0.25rem' }} color="warning" onClick={() => handleUnRestrict(vendor._id)}>
                    <CIcon icon={cilLockUnlocked} />
                  </CButton>}
                  {vendor.isRestricted?<CButton style={{ margin: '0.25rem' }} disabled color="danger" onClick={() => handleRestrict(vendor._id)}>
                    <CIcon icon={cilBan} />
                  </CButton>:<CButton style={{ margin: '0.25rem' }}  color="danger" onClick={() => handleRestrict(vendor._id)}>
                    <CIcon icon={cilBan} />
                  </CButton>}
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
