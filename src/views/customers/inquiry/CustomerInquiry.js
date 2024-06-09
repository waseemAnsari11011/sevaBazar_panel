import React, { useState, useEffect } from 'react';
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CSpinner,
  CFormInput,
  CBadge
} from '@coreui/react';
import { startLoading, stopLoading } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import getAllInquiries from '../../../api/Inquiry/getAllInquiries';
import sendInquiryResponse from '../../../api/Inquiry/sendInquiryResponse';

const CustomerInquiry = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [response, setResponse] = useState('');
  const [selectedInquiryId, setSelectedInquiryId] = useState(null); // State to track selected inquiry ID
  const isLoading = useSelector((state) => state.loading);

  // Function to toggle modal visibility
  const toggleModal = (inquiryId = null) => {
    setSelectedInquiryId(inquiryId);
    setIsModalOpen(!isModalOpen);
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

  const handleResponseChange = (e) => {
    setResponse(e.target.value);
  };

  const handleSubmitResponse = async () => { // No need to pass InquiryId as a parameter
    try {
      console.log("response=>", response)
      await sendInquiryResponse(selectedInquiryId, response); // Use selectedInquiryId state
      toggleModal();
      setResponse('');
      fetchInquiries();
    } catch (error) {
      console.error('Failed to respond to inquiry:', error);
      setError('Failed to respond to inquiry');
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
    <div>
      {isLoading && <CSpinner size="sm" color="blue" />}
      <CTable responsive="sm" striped>
        <CTableHead>
          <CTableRow>
            <CTableHeaderCell>#</CTableHeaderCell>
            <CTableHeaderCell>Subject</CTableHeaderCell>
            <CTableHeaderCell>Message</CTableHeaderCell>
            <CTableHeaderCell>Response</CTableHeaderCell>
            <CTableHeaderCell>Status</CTableHeaderCell>
            <CTableHeaderCell>Actions</CTableHeaderCell>
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

              <CTableDataCell>
                <CButton color="primary" onClick={() => toggleModal(inquiry._id)}>Send Response</CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>

      <CModal visible={isModalOpen} onClose={() => toggleModal()}>
        <CModalHeader closeButton>Send a Response</CModalHeader>
        <CModalBody>
          <CFormInput
            type="text"
            value={response}
            onChange={handleResponseChange}
            placeholder="Type your response here"
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="primary" onClick={handleSubmitResponse}>
            Submit
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  );
};

export default CustomerInquiry;
