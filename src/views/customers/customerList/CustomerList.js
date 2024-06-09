import { useCallback, useState, useEffect } from 'react';
import getAllCustomers from '../../../api/customer/getAllCustomer';
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
import { restrictCustomer, unRestrictCustomer } from '../../../api/customer/restrictUnrestrict';

const CustomerList = () => {
  const dispatch = useDispatch()
  const [customers, setCustomers] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    let timeout;
    if (alertVisible) {
      timeout = setTimeout(() => {
        setAlertVisible(false);
      }, 1000); // Hide alert after 5 seconds (adjust as needed)
    }
    return () => clearTimeout(timeout);
  }, [alertVisible]);


  const fetchCustomers = async () => {
    try {
      dispatch(startLoading())
      const customersData = await getAllCustomers();
      setCustomers(customersData);
      dispatch(stopLoading())
    } catch (error) {
      dispatch(stopLoading())
      console.error('Failed to fetch customers:', error);
    }
  };
  useEffect(() => {

    fetchCustomers();
  }, []);

  const handleUnRestrict = async (customerId) => {
    try {
      await unRestrictCustomer(customerId)
      setAlertMessage('Unrestricted Successfully')
      setAlertVisible(true)
      fetchCustomers();
    } catch (error) {
    }
  }

  const handleRestrict = async (customerId) => {
    try {
      await restrictCustomer(customerId)
      setAlertMessage('restricted Successfully')
      setAlertVisible(true)
      fetchCustomers();
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
            <CTableHeaderCell>Address</CTableHeaderCell>
            <CTableHeaderCell>Pincode</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {customers.map((customer, index) => (
            <CTableRow key={index}>

              <CTableDataCell>{customer.name}</CTableDataCell>
              <CTableDataCell>{customer.email}</CTableDataCell>
              <CTableDataCell>{customer.contactNumber}</CTableDataCell>
              <CTableDataCell>{customer?.shippingAddresses?.[0]?.address}</CTableDataCell>
              <CTableDataCell>{customer?.availableLocalities}</CTableDataCell>
              <CTableDataCell>
                <div className='actions-cell'>
                  {!customer.isRestricted ? <CButton style={{ margin: '0.25rem' }} disabled color="warning" onClick={() => handleUnRestrict(customer._id)}>
                    <CIcon icon={cilLockUnlocked} />
                  </CButton> : <CButton style={{ margin: '0.25rem' }} color="warning" onClick={() => handleUnRestrict(customer._id)}>
                    <CIcon icon={cilLockUnlocked} />
                  </CButton>}
                  {customer.isRestricted ? <CButton style={{ margin: '0.25rem' }} disabled color="danger" onClick={() => handleRestrict(customer._id)}>
                    <CIcon icon={cilBan} />
                  </CButton> : <CButton style={{ margin: '0.25rem' }} color="danger" onClick={() => handleRestrict(customer._id)}>
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

export default CustomerList
